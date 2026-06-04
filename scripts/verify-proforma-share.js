// Phase 1 acceptance verification for investor proforma sharing.
// Boots the REAL routers (admin + token) in-process with the real auth
// middleware, then exercises the acceptance criteria end-to-end over HTTP.
//
//   1. Create a share from a master  -> master row unchanged
//   2. GET /share/:token             -> returns variant + computed
//   3. PUT (edit mode)               -> mutates ONLY the variant
//   4. PUT (view mode)               -> 403
//   5. Any attempt to reach a master -> 403 / never serves a master
//
// Run: node scripts/verify-proforma-share.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import proformaRoutes from '../server/routes/proforma.js';
import proformaShareRoutes from '../server/routes/proformaShare.js';
import { getDefaultAssumptions } from '../shared/proformaDefaults.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

let passed = 0;
let failed = 0;
function check(label, cond, detail = '') {
  if (cond) { passed++; console.log(`  ✅ ${label}`); }
  else { failed++; console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));
  app.locals.prisma = prisma;
  // Mirror server/index.js mount order.
  app.use('/api/proforma/share', proformaShareRoutes);
  app.use('/api/proforma', proformaRoutes);

  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}`;

  const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN', isActive: true } });
  if (!admin) throw new Error('No SUPER_ADMIN user found to mint a JWT');
  const adminJwt = jwt.sign({ userId: admin.id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });
  const authHdr = { Authorization: `Bearer ${adminJwt}`, 'Content-Type': 'application/json' };

  const api = async (method, path, { body, headers } = {}) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: headers || { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    let json = null;
    try { json = await res.json(); } catch { /* no body */ }
    return { status: res.status, json };
  };

  // --- Set up a fresh master scenario owned by the admin ---
  const master = await prisma.proformaScenario.create({
    data: {
      name: `__verify_master_${Date.now()}`,
      description: 'verification master',
      assumptions: getDefaultAssumptions(),
      createdById: admin.id
    }
  });
  const masterAssumptionsBefore = JSON.stringify(master.assumptions);
  const cleanupIds = [master.id];

  try {
    console.log('\n[1] Create a share from a master (view + edit)');
    const viewShare = await api('POST', `/api/proforma/scenarios/${master.id}/share`, { headers: authHdr, body: { mode: 'view' } });
    const editShare = await api('POST', `/api/proforma/scenarios/${master.id}/share`, { headers: authHdr, body: { mode: 'edit' } });
    check('view-share created (201)', viewShare.status === 201, `got ${viewShare.status}`);
    check('edit-share created (201)', editShare.status === 201, `got ${editShare.status}`);
    const viewToken = viewShare.json?.share?.token;
    const editToken = editShare.json?.share?.token;
    const viewVariantId = viewShare.json?.variant?.id;
    const editVariantId = editShare.json?.variant?.id;
    if (viewVariantId) cleanupIds.push(viewVariantId);
    if (editVariantId) cleanupIds.push(editVariantId);
    check('tokens minted', !!viewToken && !!editToken);
    check('variant id differs from master', editVariantId && editVariantId !== master.id);

    const masterAfterShare = await prisma.proformaScenario.findUnique({ where: { id: master.id } });
    check('master row UNCHANGED after share', JSON.stringify(masterAfterShare.assumptions) === masterAssumptionsBefore && masterAfterShare.isVariant === false);
    const variantRow = await prisma.proformaScenario.findUnique({ where: { id: editVariantId } });
    check('variant flagged isVariant + parentId=master', variantRow?.isVariant === true && variantRow?.parentId === master.id);

    console.log('\n[2] GET /share/:token returns variant + computed');
    const getView = await api('GET', `/api/proforma/share/${viewToken}`);
    check('GET 200', getView.status === 200, `got ${getView.status}`);
    check('GET returns assumptions', !!getView.json?.scenario?.assumptions);
    check('GET returns computed', !!getView.json?.computed);
    check('GET reports mode=view', getView.json?.mode === 'view');
    check('GET serves the variant, not the master', getView.json?.scenario?.id === viewVariantId && getView.json?.scenario?.id !== master.id);

    console.log('\n[3] PUT in edit mode mutates ONLY the variant');
    const mutated = getDefaultAssumptions();
    mutated.__verifyMarker = 'edited-via-token';
    const putEdit = await api('PUT', `/api/proforma/share/${editToken}`, { body: { assumptions: mutated } });
    check('edit PUT 200', putEdit.status === 200, `got ${putEdit.status}`);
    const editVariantAfter = await prisma.proformaScenario.findUnique({ where: { id: editVariantId } });
    check('variant assumptions updated', editVariantAfter?.assumptions?.__verifyMarker === 'edited-via-token');
    const masterAfterPut = await prisma.proformaScenario.findUnique({ where: { id: master.id } });
    check('master STILL unchanged after edit-PUT', JSON.stringify(masterAfterPut.assumptions) === masterAssumptionsBefore);

    console.log('\n[4] PUT in view mode returns 403');
    const putView = await api('PUT', `/api/proforma/share/${viewToken}`, { body: { assumptions: mutated } });
    check('view PUT rejected (403)', putView.status === 403, `got ${putView.status}`);
    const viewVariantAfter = await prisma.proformaScenario.findUnique({ where: { id: viewVariantId } });
    check('view variant NOT mutated', viewVariantAfter?.assumptions?.__verifyMarker === undefined);

    console.log('\n[5] Master-reach attempts are blocked');
    // 5a. A share token whose target is a master is rejected (simulate id substitution / mis-pointed token).
    const badShare = await prisma.proformaShare.create({
      data: { token: `__verify_bad_${Date.now()}`, scenarioId: master.id, mode: 'edit', createdById: admin.id }
    });
    const getBad = await api('GET', `/api/proforma/share/${badShare.token}`);
    const putBad = await api('PUT', `/api/proforma/share/${badShare.token}`, { body: { assumptions: mutated } });
    check('GET on master-pointing token -> 403', getBad.status === 403, `got ${getBad.status}`);
    check('PUT on master-pointing token -> 403', putBad.status === 403, `got ${putBad.status}`);
    const masterAfterBad = await prisma.proformaScenario.findUnique({ where: { id: master.id } });
    check('master untouched by master-pointing token', JSON.stringify(masterAfterBad.assumptions) === masterAssumptionsBefore);
    await prisma.proformaShare.delete({ where: { id: badShare.id } });

    // 5b. The token endpoints accept NO scenario id from the client — there is no
    //     route param/body field that could substitute a master id. The admin
    //     share/scenario routes require a valid super-admin JWT.
    const noAuth = await api('GET', `/api/proforma/scenarios/${master.id}`);
    check('admin scenario route w/o JWT -> 401/403', noAuth.status === 401 || noAuth.status === 403, `got ${noAuth.status}`);

    // 5c. Revoked token is rejected.
    const revShare = await api('POST', `/api/proforma/scenarios/${master.id}/share`, { headers: authHdr, body: { mode: 'edit' } });
    const revToken = revShare.json?.share?.token;
    if (revShare.json?.variant?.id) cleanupIds.push(revShare.json.variant.id);
    await api('POST', `/api/proforma/shares/${revShare.json.share.id}/revoke`, { headers: authHdr });
    const getRevoked = await api('GET', `/api/proforma/share/${revToken}`);
    check('revoked token -> 404', getRevoked.status === 404, `got ${getRevoked.status}`);

    console.log('\n[6] Variants excluded from the admin scenario list');
    const list = await api('GET', `/api/proforma/scenarios`, { headers: authHdr });
    const listIds = (list.json || []).map((s) => s.id);
    check('list contains the master', listIds.includes(master.id));
    check('list excludes variants', !listIds.includes(editVariantId) && !listIds.includes(viewVariantId));

    console.log('\n[7] DELETE hardening — locked scenario cannot be deleted');
    const lockMaster = await prisma.proformaScenario.create({
      data: { name: `__verify_locked_${Date.now()}`, assumptions: getDefaultAssumptions(), locked: true, createdById: admin.id }
    });
    cleanupIds.push(lockMaster.id);
    const delLocked = await api('DELETE', `/api/proforma/scenarios/${lockMaster.id}`, { headers: authHdr });
    check('DELETE on locked -> 403', delLocked.status === 403, `got ${delLocked.status}`);
    const stillThere = await prisma.proformaScenario.findUnique({ where: { id: lockMaster.id } });
    check('locked scenario still exists', !!stillThere);
  } finally {
    // Cleanup: shares cascade on variant delete; delete variants first, then masters.
    for (const id of cleanupIds) {
      await prisma.proformaScenario.delete({ where: { id } }).catch(() => {});
    }
    server.close();
    await prisma.$disconnect();
  }

  console.log(`\n${failed === 0 ? '✅ ALL PASSED' : '❌ FAILURES'} — ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => { console.error(err); process.exit(1); });
