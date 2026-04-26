/**
 * GoalService
 * Goal management logic. Methods receive appContext (Alpine instance).
 */

import API from './api.js';

class GoalService {

  async loadGoals(ctx) {
    ctx.goalLoading = true;
    try {
      const params = {};
      if (ctx.goalFilters?.status) params.status = ctx.goalFilters.status;
      if (ctx.goalFilters?.ownerId) params.ownerId = ctx.goalFilters.ownerId;
      if (ctx.goalSearch) params.search = ctx.goalSearch;
      if (ctx.showArchivedGoals) params.includeArchived = true;
      ctx.goals = await API.goals.getAll(params);
    } catch (error) {
      console.error('Failed to load goals:', error);
      ctx.goals = [];
    } finally {
      ctx.goalLoading = false;
    }
  }

  openGoalForm(ctx) {
    ctx.editingGoal = null;
    ctx.goalForm = { title: '', description: '', status: 'ACTIVE', targetDate: '', ownerId: '', tags: [] };
    ctx.showGoalForm = true;
  }

  openEditGoalForm(ctx, goal) {
    ctx.editingGoal = goal;
    ctx.goalForm = {
      title: goal.title,
      description: goal.description || '',
      status: goal.status,
      targetDate: goal.targetDate || '',
      ownerId: goal.owner?.id || goal.ownerId || '',
      tags: [...(goal.tags || [])]
    };
    ctx.showGoalForm = true;
  }

  closeGoalForm(ctx) {
    ctx.showGoalForm = false;
    ctx.editingGoal = null;
  }

  async saveGoal(ctx) {
    try {
      if (ctx.editingGoal) {
        await API.goals.update(ctx.editingGoal.id, ctx.goalForm);
      } else {
        await API.goals.create(ctx.goalForm);
      }
      this.closeGoalForm(ctx);
      await this.loadGoals(ctx);
      if (ctx.selectedGoal) {
        ctx.selectedGoal = await API.goals.getById(ctx.selectedGoal.id);
      }
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('Failed to save goal: ' + error.message);
    }
  }

  async deleteGoal(ctx, goalId) {
    if (!confirm('Archive this goal? Tasks will be unlinked but not deleted.')) return;
    try {
      await API.goals.delete(goalId);
      if (ctx.selectedGoal?.id === goalId) this.closeGoalDetail(ctx);
      await this.loadGoals(ctx);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal: ' + error.message);
    }
  }

  async restoreGoal(ctx, goalId) {
    try {
      await API.goals.restore(goalId);
      await this.loadGoals(ctx);
    } catch (error) {
      console.error('Failed to restore goal:', error);
    }
  }

  async openGoalDetail(ctx, goalId) {
    try {
      ctx.selectedGoal = await API.goals.getById(goalId);
      ctx.showGoalDetail = true;
    } catch (error) {
      console.error('Failed to load goal:', error);
    }
  }

  closeGoalDetail(ctx) {
    ctx.showGoalDetail = false;
    ctx.selectedGoal = null;
  }

  async refreshSelectedGoal(ctx) {
    if (!ctx.selectedGoal) return;
    try {
      ctx.selectedGoal = await API.goals.getById(ctx.selectedGoal.id);
    } catch (error) {
      console.error('Failed to refresh goal:', error);
    }
  }

  async updateGoalInline(ctx, goalId, field, value) {
    const isSelected = ctx.selectedGoal?.id === goalId;
    const previousValue = isSelected ? ctx.selectedGoal[field] : undefined;
    if (isSelected) ctx.selectedGoal[field] = value;
    try {
      await API.goals.update(goalId, { [field]: value });
      await this.loadGoals(ctx);
      if (isSelected) ctx.selectedGoal = await API.goals.getById(goalId);
    } catch (error) {
      console.error('Failed to update goal:', error);
      if (isSelected) ctx.selectedGoal[field] = previousValue;
      alert('Failed to save change: ' + (error.message || 'Unknown error'));
    }
  }

  async linkTasksToGoal(ctx, goalId, taskIds) {
    if (!taskIds.length) return;
    try {
      await API.goals.setTasks(goalId, { addTaskIds: taskIds });
      if (ctx.selectedGoal?.id === goalId) await this.refreshSelectedGoal(ctx);
      await this.loadGoals(ctx);
    } catch (error) {
      console.error('Failed to link tasks:', error);
      alert('Failed to link tasks: ' + error.message);
    }
  }

  async unlinkTaskFromGoal(ctx, goalId, taskId) {
    try {
      await API.goals.setTasks(goalId, { removeTaskIds: [taskId] });
      if (ctx.selectedGoal?.id === goalId) await this.refreshSelectedGoal(ctx);
      await this.loadGoals(ctx);
    } catch (error) {
      console.error('Failed to unlink task:', error);
    }
  }
}

export default new GoalService();
