/**
 * PipelineService
 * Extracted pipeline/CRM management logic from app-refactored.js.
 * Follows the CRUDService pattern: methods receive appContext (Alpine instance).
 */

import API from './api.js';

export const PIPELINE_STAGES = {
  CLIENT: [
    { key: 'LEAD', label: 'Lead', color: 'gray' },
    { key: 'QUALIFIED', label: 'Qualified', color: 'blue' },
    { key: 'SAMPLE_SENT', label: 'Sample Sent', color: 'indigo' },
    { key: 'EVALUATION', label: 'Evaluation', color: 'amber' },
    { key: 'NEGOTIATION', label: 'Negotiation', color: 'orange' },
    { key: 'WON', label: 'Won', color: 'green' },
    { key: 'LOST', label: 'Lost', color: 'red' },
  ],
  INVESTOR: [
    { key: 'IDENTIFIED', label: 'Identified', color: 'gray' },
    { key: 'OUTREACH', label: 'Outreach', color: 'blue' },
    { key: 'MEETING', label: 'Meeting', color: 'indigo' },
    { key: 'DUE_DILIGENCE', label: 'Due Diligence', color: 'amber' },
    { key: 'TERM_SHEET', label: 'Term Sheet', color: 'orange' },
    { key: 'COMMITTED', label: 'Committed', color: 'green' },
    { key: 'PASSED', label: 'Passed', color: 'red' },
  ],
  PARTNER: [
    { key: 'IDENTIFIED', label: 'Identified', color: 'gray' },
    { key: 'INITIAL_CONTACT', label: 'Initial Contact', color: 'blue' },
    { key: 'EXPLORING', label: 'Exploring', color: 'indigo' },
    { key: 'PROPOSAL', label: 'Proposal', color: 'amber' },
    { key: 'ACTIVE', label: 'Active', color: 'green' },
    { key: 'INACTIVE', label: 'Inactive', color: 'red' },
  ],
};

const STAGE_COLOR_MAP = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  amber: 'bg-amber-100 text-amber-700',
  orange: 'bg-orange-100 text-orange-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
};

const ALL_STAGES = [...PIPELINE_STAGES.CLIENT, ...PIPELINE_STAGES.INVESTOR, ...PIPELINE_STAGES.PARTNER];

const ACTIVITY_LABELS = {
  created: 'Created', note_added: 'Note', call_logged: 'Call',
  email_sent: 'Email', meeting: 'Meeting', stage_changed: 'Stage changed',
  type_changed: 'Type changed', owner_changed: 'Owner changed',
  attachment_added: 'File added', attachment_removed: 'File removed',
  added_to_pipeline: 'Added to pipeline', removed_from_pipeline: 'Removed from pipeline'
};

const ACTIVITY_ICONS = {
  note_added: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  call_logged: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  email_sent: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  meeting: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  stage_changed: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  created: 'M12 4v16m8-8H4',
};

class PipelineService {

  // Stage helpers

  getPipelineStages(pipelineType) {
    return PIPELINE_STAGES[pipelineType] || PIPELINE_STAGES.CLIENT;
  }

  getStageLabel(stageKey) {
    const found = ALL_STAGES.find(s => s.key === stageKey);
    return found ? found.label : stageKey;
  }

  getStageBadgeClass(stageKey) {
    const found = ALL_STAGES.find(s => s.key === stageKey);
    return found ? (STAGE_COLOR_MAP[found.color] || STAGE_COLOR_MAP.gray) : STAGE_COLOR_MAP.gray;
  }

  formatActivityAction(action) {
    return ACTIVITY_LABELS[action] || action;
  }

  getActivityIcon(action) {
    return ACTIVITY_ICONS[action] || ACTIVITY_ICONS.note_added;
  }

  // Data loading

  async loadPipelineContacts(ctx) {
    try {
      const params = {};
      if (ctx.pipelineSearch) params.search = ctx.pipelineSearch;
      if (ctx.pipelineFilters.ownerId) params.ownerId = ctx.pipelineFilters.ownerId;
      ctx.pipelineContacts = await API.pipeline.getContacts(params);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      ctx.pipelineContacts = [];
    }
  }

  async loadPipelineBoard(ctx) {
    ctx.pipelineLoading = true;
    try {
      const params = { contactType: ctx.pipelineType, onPipeline: true, sortBy: 'position', order: 'asc' };
      if (ctx.pipelineSearch) params.search = ctx.pipelineSearch;
      if (ctx.pipelineFilters.ownerId) params.ownerId = ctx.pipelineFilters.ownerId;
      ctx.pipelineBoardContacts = await API.pipeline.getContacts(params);
    } catch (error) {
      console.error('Failed to load pipeline board:', error);
      ctx.pipelineBoardContacts = [];
    } finally {
      ctx.pipelineLoading = false;
      ctx.$nextTick(() => {
        if (ctx.pipelineViewMode === 'kanban') ctx.initPipelineKanban();
      });
    }
  }

  async loadPipelineOwners(ctx) {
    try {
      ctx.pipelineOwners = await API.pipeline.getOwners();
    } catch (error) {
      console.error('Failed to load pipeline owners:', error);
      ctx.pipelineOwners = [];
    }
  }

  // Contact CRUD

  openContactForm(ctx, type, kind) {
    ctx.editingContact = null;
    ctx.contactForm = { name: '', contactKind: kind || 'PERSON', email: '', phone: '', role: '', contactType: type || '', contactTypes: type ? [type] : [], source: '', tags: [], notes: '', linkedInUrl: '', website: '', companyId: '', linkPersonId: '', ownerId: '', nextFollowUpAt: '' };
    ctx.pipelineTagInput = '';
    ctx.showAddContact = true;
  }

  openEditContactForm(ctx, contact) {
    ctx.editingContact = contact;
    ctx.contactForm = {
      name: contact.name,
      contactKind: contact.contactKind || 'PERSON',
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role || '',
      contactType: contact.contactType || '',
      contactTypes: [...(contact.contactTypes || [])],
      source: contact.source || '',
      tags: [...(contact.tags || [])],
      notes: contact.notes || '',
      linkedInUrl: contact.linkedInUrl || '',
      website: contact.website || '',
      companyId: contact.companyId || '',
      linkPersonId: '',
      ownerId: contact.ownerId || '',
      nextFollowUpAt: contact.nextFollowUpAt || ''
    };
    ctx.pipelineTagInput = '';
    ctx.showAddContact = true;
  }

  closeContactForm(ctx) {
    ctx.showAddContact = false;
    ctx.editingContact = null;
  }

  async saveContact(ctx) {
    try {
      const formData = { ...ctx.contactForm };
      const linkPersonId = formData.linkPersonId;
      delete formData.linkPersonId;

      let savedContact;
      if (ctx.editingContact) {
        savedContact = await API.pipeline.updateContact(ctx.editingContact.id, formData);
      } else {
        savedContact = await API.pipeline.createContact(formData);
      }

      if (linkPersonId && savedContact?.id && formData.contactKind === 'COMPANY') {
        await API.pipeline.updateContact(linkPersonId, { companyId: savedContact.id });
      }

      this.closeContactForm(ctx);
      await this.loadPipelineContacts(ctx);
      if (ctx.selectedContact) {
        ctx.selectedContact = await API.pipeline.getContact(ctx.selectedContact.id);
      }
    } catch (error) {
      console.error('Failed to save contact:', error);
      alert('Failed to save contact: ' + error.message);
    }
  }

  async deleteContact(ctx, contactId) {
    if (!confirm('Delete this contact and all associated data?')) return;
    try {
      await API.pipeline.deleteContact(contactId);
      if (ctx.selectedContact?.id === contactId) this.closeContactDetail(ctx);
      await this.loadPipelineContacts(ctx);
      await this.loadPipelineBoard(ctx);
    } catch (error) {
      console.error('Failed to delete contact:', error);
      alert('Failed to delete contact: ' + error.message);
    }
  }

  async openContactDetail(ctx, contactId) {
    try {
      ctx.selectedContact = await API.pipeline.getContact(contactId);
      ctx.showContactDetail = true;
    } catch (error) {
      console.error('Failed to load contact detail:', error);
    }
  }

  closeContactDetail(ctx) {
    ctx.showContactDetail = false;
    ctx.selectedContact = null;
    ctx.contactActivityForm = { action: 'note_added', content: '' };
  }

  async updateContactInline(ctx, contactId, field, value) {
    try {
      await API.pipeline.updateContact(contactId, { [field]: value });
      await this.loadPipelineContacts(ctx);
      if (field === 'stage' || field === 'ownerId' || field === 'pipelineTitle') {
        await this.loadPipelineBoard(ctx);
      }
      if (ctx.selectedContact?.id === contactId) {
        ctx.selectedContact = await API.pipeline.getContact(contactId);
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  }

  async addContactActivity(ctx) {
    if (!ctx.contactActivityForm.content?.trim() || !ctx.selectedContact) return;
    try {
      await API.pipeline.addContactActivity(ctx.selectedContact.id, ctx.contactActivityForm);
      ctx.contactActivityForm = { action: 'note_added', content: '' };
      ctx.selectedContact = await API.pipeline.getContact(ctx.selectedContact.id);
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  }

  async uploadContactAttachments(ctx, files) {
    if (!files?.length || !ctx.selectedContact) return;
    ctx.contactAttachmentUploading = true;
    try {
      await API.pipeline.uploadContactAttachments(ctx.selectedContact.id, Array.from(files));
      ctx.selectedContact = await API.pipeline.getContact(ctx.selectedContact.id);
    } catch (error) {
      console.error('Failed to upload attachments:', error);
      alert('Failed to upload: ' + error.message);
    } finally {
      ctx.contactAttachmentUploading = false;
    }
  }

  async deleteContactAttachment(ctx, attachmentId, fileName) {
    if (!ctx.selectedContact) return;
    if (!confirm('Delete "' + fileName + '"?')) return;
    try {
      await API.pipeline.deleteContactAttachment(ctx.selectedContact.id, attachmentId);
      ctx.selectedContact = await API.pipeline.getContact(ctx.selectedContact.id);
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  }

  // Pipeline board operations

  openAddToPipeline(ctx, presetStage) {
    ctx.addToPipelineForm = { contactId: '', pipelineType: ctx.pipelineType || 'INVESTOR', pipelineTitle: '' };
    ctx.addToPipelineSearch = '';
    ctx.addToPipelinePresetStage = presetStage || '';
    ctx.showAddToPipeline = true;
  }

  closeAddToPipeline(ctx) {
    ctx.showAddToPipeline = false;
    ctx.addToPipelineSearch = '';
  }

  async addToPipeline(ctx) {
    if (!ctx.addToPipelineForm.contactId || !ctx.addToPipelineForm.pipelineType) {
      alert('Please select a contact and pipeline type.');
      return;
    }
    try {
      await API.pipeline.addToPipeline(ctx.addToPipelineForm.contactId, {
        contactType: ctx.addToPipelineForm.pipelineType,
        pipelineTitle: ctx.addToPipelineForm.pipelineTitle || null
      });
      this.closeAddToPipeline(ctx);
      await this.loadPipelineBoard(ctx);
      await this.loadPipelineContacts(ctx);
    } catch (error) {
      console.error('Failed to add to pipeline:', error);
      alert('Failed to add to pipeline: ' + error.message);
    }
  }

  async removeFromPipeline(ctx, contactId) {
    if (!confirm('Remove this contact from the pipeline?')) return;
    try {
      await API.pipeline.removeFromPipeline(contactId);
      if (ctx.selectedContact?.id === contactId) {
        ctx.selectedContact = await API.pipeline.getContact(contactId);
      }
      await this.loadPipelineBoard(ctx);
      await this.loadPipelineContacts(ctx);
    } catch (error) {
      console.error('Failed to remove from pipeline:', error);
      alert('Failed to remove from pipeline: ' + error.message);
    }
  }

  // View switching

  async switchPipelineType(ctx, type) {
    ctx.pipelineType = type;
    await this.loadPipelineBoard(ctx);
    ctx.$nextTick(() => {
      if (ctx.pipelineViewMode === 'kanban') ctx.initPipelineKanban();
    });
  }

  async switchPipelineView(ctx, mode) {
    ctx.pipelineViewMode = mode;
    if (mode === 'kanban') {
      await this.loadPipelineBoard(ctx);
      ctx.$nextTick(() => ctx.initPipelineKanban());
    } else if (mode === 'contacts') {
      await this.loadPipelineContacts(ctx);
    }
  }

  pipelineSearchDebounced(ctx) {
    if (ctx._pipelineSearchTimer) clearTimeout(ctx._pipelineSearchTimer);
    ctx._pipelineSearchTimer = setTimeout(async () => {
      if (ctx.pipelineViewMode === 'contacts') {
        await this.loadPipelineContacts(ctx);
      } else {
        await this.loadPipelineBoard(ctx);
      }
    }, 300);
  }
}

const pipelineService = new PipelineService();
export default pipelineService;
