import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';

const TASKS_STORAGE_KEY = 'ITRACK_TASKS_DATA';

// Simple ID generator
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const TaskStorageService = {
  async getAllTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      console.log('Saving tasks:', tasks.length, 'tasks');
      const tasksString = JSON.stringify(tasks);
      console.log('Tasks JSON string length:', tasksString.length);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, tasksString);
      console.log('Tasks saved successfully to AsyncStorage');
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  },

  async addTask(title: string, parentId?: string): Promise<Task> {
    try {
      const tasks = await this.getAllTasks();
      const level = parentId ? (tasks.find(t => t.id === parentId)?.level || 0) + 1 : 0;
      
      const newTask: Task = {
        id: generateId(),
        title,
        completed: false,
        parentId,
        level,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      tasks.push(newTask);
      await this.saveTasks(tasks);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const tasks = await this.getAllTasks();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex >= 0) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await this.saveTasks(tasks);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      console.log('Deleting task:', taskId);
      const tasks = await this.getAllTasks();
      console.log('Current tasks before delete:', tasks.length);
      
      // Get all descendant tasks to delete them too
      const getDescendants = (id: string): string[] => {
        const children = tasks.filter(t => t.parentId === id).map(t => t.id);
        const descendants = [...children];
        children.forEach(childId => {
          descendants.push(...getDescendants(childId));
        });
        return descendants;
      };

      const toDelete = [taskId, ...getDescendants(taskId)];
      console.log('Tasks to delete:', toDelete);
      const filteredTasks = tasks.filter(t => !toDelete.includes(t.id));
      console.log('Tasks after filter:', filteredTasks.length);
      
      await this.saveTasks(filteredTasks);
      console.log('Tasks saved successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async toggleTaskCompletion(taskId: string): Promise<void> {
    try {
      const tasks = await this.getAllTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        const newCompletedState = !task.completed;
        
        // Update the task itself
        await this.updateTask(taskId, { completed: newCompletedState });
        
        // If marking as complete, mark all subtasks as complete
        // If marking as incomplete, mark all parent tasks as incomplete
        if (newCompletedState) {
          await this.markSubtasksComplete(taskId);
        } else {
          await this.markParentTasksIncomplete(taskId);
        }
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  },

  async markSubtasksComplete(parentId: string): Promise<void> {
    const tasks = await this.getAllTasks();
    const subtasks = tasks.filter(t => t.parentId === parentId);
    
    for (const subtask of subtasks) {
      await this.updateTask(subtask.id, { completed: true });
      await this.markSubtasksComplete(subtask.id);
    }
  },

  async markParentTasksIncomplete(taskId: string): Promise<void> {
    const tasks = await this.getAllTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (task?.parentId) {
      await this.updateTask(task.parentId, { completed: false });
      await this.markParentTasksIncomplete(task.parentId);
    }
  },

  async getTaskHierarchy(): Promise<Task[]> {
    try {
      const tasks = await this.getAllTasks();
      
      // Sort tasks by level and creation time for display
      return tasks.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    } catch (error) {
      console.error('Error getting task hierarchy:', error);
      return [];
    }
  }
};
