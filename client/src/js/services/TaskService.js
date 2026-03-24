/**
 * TaskService
 * Extracted task management logic from app-refactored.js.
 * Follows the CRUDService pattern: methods receive appContext (Alpine instance).
 */

import API from './api.js';

class TaskService {

  async loadTasks(ctx) {
    ctx.taskLoading = true;
    try {
      const params = {};
      if (ctx.taskFilters.status) params.status = ctx.taskFilters.status;
      if (ctx.taskFilters.priority) params.priority = ctx.taskFilters.priority;
      if (ctx.taskFilters.assigneeId) params.assigneeId = ctx.taskFilters.assigneeId;
      if (ctx.taskFilters.overdue) params.overdue = true;
      if (ctx.taskSearch) params.search = ctx.taskSearch;
      ctx.tasks = await API.tasks.getAll(params);
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
    ctx.taskForm = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '', parentId, tags: [] };
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
      assigneeId: task.assigneeId || '',
      parentId: task.parentId || null,
      tags: [...(task.tags || [])]
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
      if (ctx.editingTask) {
        await API.tasks.update(ctx.editingTask.id, ctx.taskForm);
      } else {
        await API.tasks.create(ctx.taskForm);
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
    try {
      await API.tasks.update(taskId, { [field]: value });
      await this.loadTasks(ctx);
      if (ctx.selectedTask?.id === taskId) {
        ctx.selectedTask = await API.tasks.getById(taskId);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  async addSubtask(ctx, parentId) {
    const title = prompt('Subtask title:');
    if (!title?.trim()) return;
    try {
      await API.tasks.create({ title: title.trim(), parentId, status: 'TODO', priority: 'MEDIUM' });
      if (ctx.selectedTask?.id === parentId) {
        ctx.selectedTask = await API.tasks.getById(parentId);
      }
      await this.loadTasks(ctx);
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  }

  async toggleSubtaskDone(ctx, subtask) {
    const newStatus = subtask.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      await API.tasks.updateStatus(subtask.id, newStatus);
      if (ctx.selectedTask) {
        ctx.selectedTask = await API.tasks.getById(ctx.selectedTask.id);
      }
      await this.loadTasks(ctx);
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
    }
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
