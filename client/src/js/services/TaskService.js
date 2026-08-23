/**
 * TaskService
 * Extracted task management logic from app-refactored.js.
 * Follows the CRUDService pattern: methods receive appContext (Alpine instance).
 */

import API from './api.js';

class TaskService {

  constructor() {
    // Parent task ids for which the user has declined "all subtasks are done, mark this done?".
    // Kept on the service rather than in Alpine state on purpose: nothing renders from it, so it
    // is not reactive state, and keeping it here avoids a D-001 wiring dependency. Cleared for a
    // parent when a new subtask is added to it (see addSubtask) — declining sticks until the
    // shape of the work changes.
    this._parentCompleteDeclined = new Set();
  }

  async loadTasks(ctx) {
    ctx.taskLoading = true;
    try {
      const params = {};
      if (ctx.taskFilters.status) params.status = ctx.taskFilters.status;
      if (ctx.taskFilters.priority) params.priority = ctx.taskFilters.priority;
      if (ctx.taskFilters.assigneeId) params.assigneeId = ctx.taskFilters.assigneeId;
      if (ctx.taskFilters.overdue) params.overdue = true;
      if (ctx.taskFilters.goalId) params.goalId = ctx.taskFilters.goalId;
      if (ctx.taskSearch) params.search = ctx.taskSearch;
      ctx.tasks = await API.tasks.getAll(params);
      // Refresh costs summary when tasks reload (kept lightweight on the server)
      if (ctx.taskCostsSummary !== undefined) {
        try { ctx.taskCostsSummary = await API.tasks.getCostsSummary(); } catch (e) { /* non-fatal */ }
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      ctx.tasks = [];
    } finally {
      ctx.taskLoading = false;
      ctx.$nextTick(() => {
        if (ctx.taskViewMode === 'kanban') ctx.initKanbanDragDrop();
      });
    }
  }

  async loadTaskAssignees(ctx) {
    try {
      ctx.taskAssignees = await API.tasks.getAssignees();
    } catch (error) {
      console.error('Failed to load assignees:', error);
      ctx.taskAssignees = [];
    }
  }

  openTaskForm(ctx, parentId = null) {
    ctx.editingTask = null;
    ctx.taskForm = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeIds: [], parentId, goalId: '', tags: [], cost: '', costPaid: false };
    ctx.taskTagInput = '';
    ctx.showAddTask = true;
  }

  openEditTaskForm(ctx, task) {
    ctx.editingTask = task;
    ctx.taskForm = {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
      assigneeIds: (task.assignees || []).map(a => a.user?.id || a.userId).filter(Boolean),
      parentId: task.parentId || null,
      goalId: task.goalId || task.goal?.id || '',
      tags: [...(task.tags || [])],
      cost: task.cost == null ? '' : String(task.cost),
      costPaid: Boolean(task.costPaid)
    };
    ctx.taskTagInput = '';
    ctx.showAddTask = true;
  }

  closeTaskForm(ctx) {
    ctx.showAddTask = false;
    ctx.editingTask = null;
  }

  async saveTask(ctx) {
    try {
      const payload = { ...ctx.taskForm };
      // Normalize cost: empty string -> null; otherwise parse number
      if (payload.cost === '' || payload.cost == null) {
        payload.cost = null;
        payload.costPaid = false;
      } else {
        const n = parseFloat(payload.cost);
        payload.cost = Number.isFinite(n) && n >= 0 ? n : null;
        if (payload.cost == null) payload.costPaid = false;
      }
      if (ctx.editingTask) {
        await API.tasks.update(ctx.editingTask.id, payload);
      } else {
        await API.tasks.create(payload);
      }
      this.closeTaskForm(ctx);
      await this.loadTasks(ctx);
      if (ctx.selectedTask) {
        ctx.selectedTask = await API.tasks.getById(ctx.selectedTask.id);
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task: ' + error.message);
    }
  }

  async toggleCostPaid(ctx, taskId, paid) {
    try {
      await API.tasks.setCostPaid(taskId, paid);
      await this.loadTasks(ctx);
      if (ctx.selectedTask?.id === taskId) {
        ctx.selectedTask = await API.tasks.getById(taskId);
      }
      if (ctx.taskCostsSummary !== undefined) {
        await this.loadCostsSummary(ctx);
      }
    } catch (error) {
      console.error('Failed to toggle cost paid:', error);
      alert('Failed to update: ' + (error.message || 'Unknown error'));
    }
  }

  async loadCostsSummary(ctx) {
    try {
      ctx.taskCostsSummary = await API.tasks.getCostsSummary();
    } catch (error) {
      console.error('Failed to load costs summary:', error);
      ctx.taskCostsSummary = { openTotal: 0, paidTotal: 0, grandTotal: 0, openCount: 0, paidCount: 0, totalCount: 0 };
    }
  }

  async deleteTask(ctx, taskId) {
    if (!confirm('Delete this task? This will also delete all subtasks.')) return;
    try {
      await API.tasks.delete(taskId);
      if (ctx.selectedTask?.id === taskId) {
        this.closeTaskDetail(ctx);
      }
      await this.loadTasks(ctx);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task: ' + error.message);
    }
  }

  async updateTaskStatus(ctx, taskId, newStatus) {
    if (newStatus === 'DONE') {
      // If we already have the full detail (selected), use its blockedBy directly;
      // otherwise fetch to get blockers before the confirm.
      let task = ctx.selectedTask?.id === taskId ? ctx.selectedTask : null;
      if (!task || !Array.isArray(task.blockedBy)) {
        try { task = await API.tasks.getById(taskId); } catch (e) { task = null; }
      }
      if (task && !this.confirmDoneIfBlocked(task)) return;
    }
    try {
      await API.tasks.updateStatus(taskId, newStatus);
      await this.loadTasks(ctx);
      if (ctx.selectedTask?.id === taskId) {
        ctx.selectedTask = await API.tasks.getById(taskId);
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  }

  async openTaskDetail(ctx, taskId) {
    try {
      ctx.selectedTask = await API.tasks.getById(taskId);
      ctx.showTaskDetail = true;
    } catch (error) {
      console.error('Failed to load task detail:', error);
    }
  }

  closeTaskDetail(ctx) {
    ctx.showTaskDetail = false;
    ctx.selectedTask = null;
    ctx.taskCommentForm.content = '';
    ctx.depPickerOpenFor = null;
    ctx.depPickerQuery = '';
    ctx.depPickerResults = [];
  }

  async addTaskComment(ctx) {
    if (!ctx.taskCommentForm.content.trim() || !ctx.selectedTask) return;
    try {
      await API.tasks.addComment(ctx.selectedTask.id, ctx.taskCommentForm.content);
      ctx.taskCommentForm.content = '';
      ctx.selectedTask = await API.tasks.getById(ctx.selectedTask.id);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  }

  async deleteTaskComment(ctx, commentId) {
    if (!ctx.selectedTask) return;
    try {
      await API.tasks.deleteComment(ctx.selectedTask.id, commentId);
      ctx.selectedTask = await API.tasks.getById(ctx.selectedTask.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  }

  async uploadTaskAttachments(ctx, files) {
    if (!files?.length || !ctx.selectedTask) return;
    ctx.taskAttachmentUploading = true;
    try {
      await API.tasks.uploadAttachments(ctx.selectedTask.id, Array.from(files));
      ctx.selectedTask = await API.tasks.getById(ctx.selectedTask.id);
    } catch (error) {
      console.error('Failed to upload attachments:', error);
      alert('Failed to upload: ' + error.message);
    } finally {
      ctx.taskAttachmentUploading = false;
    }
  }

  async deleteTaskAttachment(ctx, attachmentId, fileName) {
    if (!ctx.selectedTask) return;
    if (!confirm('Delete "' + fileName + '"?')) return;
    try {
      await API.tasks.deleteAttachment(ctx.selectedTask.id, attachmentId);
      ctx.selectedTask = await API.tasks.getById(ctx.selectedTask.id);
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  }

  async updateTaskInline(ctx, taskId, field, value) {
    const isSelected = ctx.selectedTask?.id === taskId;
    const previousValue = isSelected ? ctx.selectedTask[field] : undefined;
    if (field === 'status' && value === 'DONE') {
      const task = isSelected ? ctx.selectedTask : ctx.tasks.find(t => t.id === taskId);
      if (task && !this.confirmDoneIfBlocked(task)) return;
    }
    if (isSelected) ctx.selectedTask[field] = value;
    try {
      await API.tasks.update(taskId, { [field]: value });
      if (ctx.selectedTask?.id === taskId) {
        ctx.selectedTask = await API.tasks.getById(taskId);
      }
      await this.loadTasks(ctx);
    } catch (error) {
      console.error('Failed to update task:', error);
      if (isSelected && ctx.selectedTask?.id === taskId) {
        ctx.selectedTask[field] = previousValue;
      }
      alert('Failed to save change: ' + (error.message || 'Unknown error'));
    }
  }

  hasIncompleteBlockers(task) {
    if (!task?.blockedBy?.length) return false;
    return task.blockedBy.some(d => !['DONE', 'ARCHIVED'].includes(d.blockingTask?.status));
  }

  confirmDoneIfBlocked(task) {
    if (!this.hasIncompleteBlockers(task)) return true;
    const blockers = task.blockedBy
      .filter(d => !['DONE', 'ARCHIVED'].includes(d.blockingTask?.status))
      .map(d => '- ' + d.blockingTask.title)
      .join('\n');
    return confirm('Still blocked by:\n' + blockers + '\n\nMark done anyway?');
  }

  async linkDependency(ctx, taskId, blockingTaskId) {
    try {
      await API.tasks.addDependency(taskId, blockingTaskId);
      if (ctx.selectedTask?.id === taskId) {
        ctx.selectedTask = await API.tasks.getById(taskId);
      }
      await this.loadTasks(ctx);
    } catch (error) {
      console.error('Failed to add dependency:', error);
      alert('Failed to add dependency: ' + (error.message || 'Unknown error'));
    }
  }

  async unlinkDependency(ctx, taskId, linkId) {
    if (!confirm('Remove this link?')) return;
    try {
      await API.tasks.removeDependency(taskId, linkId);
      if (ctx.selectedTask?.id === taskId) {
        ctx.selectedTask = await API.tasks.getById(taskId);
      }
      await this.loadTasks(ctx);
    } catch (error) {
      console.error('Failed to remove dependency:', error);
      alert('Failed to remove dependency: ' + (error.message || 'Unknown error'));
    }
  }

  async searchDependencyCandidates(ctx, query, direction) {
    if (!ctx.selectedTask) return;
    const q = (query || '').trim();
    if (!q) { ctx.depPickerResults = []; return; }
    try {
      const results = await API.tasks.getAll({ search: q, parentId: 'all', limit: 20 });
      const selfId = ctx.selectedTask.id;
      // Exclude self, archived, and tasks already linked in this direction
      const existingList = direction === 'blockedBy'
        ? (ctx.selectedTask.blockedBy || []).map(d => d.blockingTask.id)
        : (ctx.selectedTask.blocking || []).map(d => d.blockedTask.id);
      const existing = new Set(existingList);
      ctx.depPickerResults = results
        .filter(t => t.id !== selfId && t.status !== 'ARCHIVED' && !existing.has(t.id))
        .slice(0, 10);
    } catch (error) {
      console.error('Dependency search failed:', error);
      ctx.depPickerResults = [];
    }
  }

  async addSubtask(ctx, parentId) {
    const title = prompt('Subtask title:');
    if (!title?.trim()) return;
    try {
      await API.tasks.create({ title: title.trim(), parentId, status: 'TODO', priority: 'MEDIUM' });
      // The work has changed shape, so an earlier "no, it isn't finished" no longer applies.
      this._parentCompleteDeclined.delete(parentId);
      if (ctx.selectedTask?.id === parentId) {
        ctx.selectedTask = await API.tasks.getById(parentId);
      }
      await this.loadTasks(ctx);
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  }

  /**
   * Rename a subtask in place. A subtask is a Task with a parentId, so this reuses the ordinary
   * task PUT — which also gets the activity log for free. Never deletes and recreates: the row's
   * id, comments, attachments and history all survive.
   * Returns true when a write was actually issued and succeeded.
   */
  async updateSubtaskTitle(ctx, subtaskId, title) {
    const next = typeof title === 'string' ? title.trim() : '';
    if (!next) return false;
    const current = (ctx.selectedTask?.subtasks || []).find(s => s.id === subtaskId);
    if (current && current.title === next) return false;
    try {
      await API.tasks.update(subtaskId, { title: next });
      if (ctx.selectedTask) {
        ctx.selectedTask = await API.tasks.getById(ctx.selectedTask.id);
      }
      return true;
    } catch (error) {
      console.error('Failed to rename subtask:', error);
      alert('Failed to rename subtask: ' + (error.message || 'Unknown error'));
      // Pull server state back so the row shows the title that actually persisted.
      if (ctx.selectedTask) {
        try { ctx.selectedTask = await API.tasks.getById(ctx.selectedTask.id); } catch (e) { /* keep last good state */ }
      }
      return false;
    }
  }

  async toggleSubtaskDone(ctx, subtask) {
    const newStatus = subtask.status === 'DONE' ? 'TODO' : 'DONE';
    const parentId = subtask.parentId || ctx.selectedTask?.id || null;

    // Route through updateTaskStatus rather than calling the API directly. A subtask can carry
    // its own TaskDependency blockers, and this checkbox used to bypass the shared DONE guard.
    await this.updateTaskStatus(ctx, subtask.id, newStatus);

    // updateTaskStatus only refetches selectedTask when it *is* the task that changed; here
    // selectedTask is the parent, so refresh it for the progress bar and the subtask list.
    if (parentId && ctx.selectedTask?.id === parentId) {
      try { ctx.selectedTask = await API.tasks.getById(parentId); } catch (e) { /* keep last good state */ }
    }

    if (newStatus === 'DONE') {
      await this.maybePromptParentComplete(ctx, parentId, subtask.id);
    }
  }

  /**
   * Should we ask whether the parent task is now finished?
   *
   * Pure: no I/O, no ctx, no side effects — so the firing rules can be exercised directly.
   * `parent` must be server state fetched *after* the toggle landed, not an optimistic guess;
   * that is what makes "the subtask that triggered this is actually DONE" a reliable test and
   * what makes a failed or declined toggle silently produce `false` instead of a stray prompt.
   *
   * ARCHIVED counts as settled, matching the blocker rule in hasIncompleteBlockers() and the
   * overdue-subtask rule in getOverdueSubtaskCount(). It deliberately does NOT match the
   * progress fraction shown in the panel, which counts only DONE — that is a display ratio.
   */
  shouldPromptParentComplete(parent, triggerSubtaskId, declinedIds = null) {
    if (!parent?.id) return false;
    // Already finished — nothing to ask.
    if (parent.status === 'DONE' || parent.status === 'ARCHIVED') return false;
    // Declining sticks for this parent, so un-completing and re-completing a subtask over and
    // over does not re-prompt.
    if (declinedIds?.has(parent.id)) return false;

    const subs = Array.isArray(parent.subtasks) ? parent.subtasks : [];
    if (!subs.length) return false;

    // Fire only on the transition that settled the last one: the subtask that triggered this
    // must belong to the parent and must be DONE on the server now.
    const trigger = subs.find(s => s.id === triggerSubtaskId);
    if (trigger?.status !== 'DONE') return false;

    return subs.every(s => s.status === 'DONE' || s.status === 'ARCHIVED');
  }

  async maybePromptParentComplete(ctx, parentId, triggerSubtaskId) {
    if (!parentId) return;

    let parent = ctx.selectedTask?.id === parentId ? ctx.selectedTask : null;
    if (!Array.isArray(parent?.subtasks)) {
      try { parent = await API.tasks.getById(parentId); } catch (e) { return; }
    }
    if (!this.shouldPromptParentComplete(parent, triggerSubtaskId, this._parentCompleteDeclined)) return;

    // Every await above has settled, so this synchronous confirm() cannot block an in-flight save.
    const total = parent.subtasks.length;
    const accepted = confirm(
      'All ' + total + ' subtask' + (total === 1 ? '' : 's') + ' of "' + parent.title + '" are complete.\n\n'
      + 'Mark this task as Done?'
    );

    if (!accepted) {
      this._parentCompleteDeclined.add(parent.id);
      return;
    }
    this._parentCompleteDeclined.delete(parent.id);

    // updateTaskStatus carries the incomplete-blocker guard, so a parent with unfinished
    // blockers still gets the existing "Still blocked by:" warning before it can reach DONE.
    await this.updateTaskStatus(ctx, parent.id, 'DONE');
  }

  async updateSubtaskDueDate(ctx, subtaskId, date) {
    try {
      await API.tasks.update(subtaskId, { dueDate: date || null });
      if (ctx.selectedTask) {
        ctx.selectedTask = await API.tasks.getById(ctx.selectedTask.id);
      }
    } catch (error) {
      console.error('Failed to update subtask due date:', error);
    }
  }

  async archiveTask(ctx, taskId) {
    try {
      await API.tasks.updateStatus(taskId, 'ARCHIVED');
      await this.loadTasks(ctx);
      if (ctx.selectedTask?.id === taskId) {
        ctx.selectedTask = await API.tasks.getById(taskId);
      }
    } catch (error) {
      console.error('Failed to archive task:', error);
    }
  }

  async unarchiveTask(ctx, taskId) {
    try {
      await API.tasks.updateStatus(taskId, 'TODO');
      await this.loadTasks(ctx);
      if (ctx.selectedTask?.id === taskId) {
        ctx.selectedTask = await API.tasks.getById(taskId);
      }
    } catch (error) {
      console.error('Failed to unarchive task:', error);
    }
  }
}

const taskService = new TaskService();
export default taskService;
