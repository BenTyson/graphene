/**
 * KanbanService
 * Reusable SortableJS wrapper for drag-and-drop Kanban boards.
 * Used by both Tasks and Pipeline tabs.
 */

class KanbanService {
  constructor() {
    this.groups = new Map(); // group name → { instances: [], columnIds: [] }
  }

  /**
   * Initialize Sortable on Kanban columns.
   * Skips reinit if column structure hasn't changed.
   *
   * @param {Object} config
   * @param {string} config.group - Sortable group name ('kanban', 'pipeline-kanban')
   * @param {string[]} config.columnIds - DOM element IDs for each column
   * @param {string} config.itemIdAttr - data attribute for item ID ('data-task-id', 'data-deal-id')
   * @param {string} config.statusAttr - data attribute on column for status/stage ('data-status', 'data-stage')
   * @param {Function} config.onReorder - callback(itemId, newStatus, oldStatus, positions)
   * @param {Object} [config.sortableOptions] - extra SortableJS options to merge
   */
  init(config) {
    if (typeof Sortable === 'undefined') return;

    const { group, columnIds, itemIdAttr, statusAttr, onReorder, sortableOptions = {} } = config;

    // Skip reinit if column structure is unchanged
    const existing = this.groups.get(group);
    if (existing && this._arraysEqual(existing.columnIds, columnIds)) {
      return;
    }

    // Destroy previous instances for this group
    this.destroy(group);

    const instances = [];

    columnIds.forEach(colId => {
      const el = document.getElementById(colId);
      if (!el) return;

      const sortable = new Sortable(el, {
        group,
        animation: 150,
        ghostClass: 'opacity-30',
        dragClass: 'shadow-lg',
        ...sortableOptions,
        onEnd: (evt) => {
          this._handleDragEnd(evt, itemIdAttr, statusAttr, onReorder);
        }
      });

      instances.push(sortable);
    });

    this.groups.set(group, { instances, columnIds: [...columnIds] });
  }

  /**
   * Destroy all Sortable instances for a group
   * @param {string} group - Group name to destroy
   */
  destroy(group) {
    const existing = this.groups.get(group);
    if (existing) {
      existing.instances.forEach(s => s.destroy());
      this.groups.delete(group);
    }
  }

  /**
   * Force reinit on next init() call by clearing stored column structure
   * @param {string} group - Group name to invalidate
   */
  invalidate(group) {
    const existing = this.groups.get(group);
    if (existing) {
      existing.columnIds = [];
    }
  }

  /**
   * Handle drag end event — extracts positions and calls onReorder
   */
  _handleDragEnd(evt, itemIdAttr, statusAttr, onReorder) {
    const itemId = evt.item.getAttribute(itemIdAttr);
    if (!itemId) return;

    const newStatus = evt.to.getAttribute(statusAttr);
    const oldStatus = evt.from.getAttribute(statusAttr);

    const toChildren = [...evt.to.children].filter(c => c.hasAttribute(itemIdAttr));
    const positions = toChildren.map((child, index) => ({
      id: child.getAttribute(itemIdAttr),
      position: index
    }));

    if (oldStatus !== newStatus) {
      const fromChildren = [...evt.from.children].filter(c => c.hasAttribute(itemIdAttr));
      fromChildren.forEach((child, index) => {
        positions.push({ id: child.getAttribute(itemIdAttr), position: index });
      });
    }

    onReorder(itemId, newStatus, oldStatus, positions);
  }

  _arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }
}

const kanbanService = new KanbanService();
export default kanbanService;
