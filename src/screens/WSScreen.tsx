import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { TaskStorageService } from '../utils/taskStorage';

export const WSScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null);
  const [subtaskText, setSubtaskText] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      console.log('Loading tasks...');
      const taskList = await TaskStorageService.getTaskHierarchy();
      console.log('Loaded tasks:', taskList.length, 'tasks');
      setTasks(taskList);
      console.log('Tasks state updated');
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const addMainTask = async () => {
    if (!newTaskText.trim()) return;
    
    try {
      await TaskStorageService.addTask(newTaskText.trim());
      setNewTaskText('');
      await loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const addSubtask = async (parentId: string) => {
    if (!subtaskText.trim()) return;
    
    try {
      await TaskStorageService.addTask(subtaskText.trim(), parentId);
      setSubtaskText('');
      setAddingSubtaskTo(null);
      
      // Expand parent task to show new subtask
      setExpandedTasks(prev => new Set([...prev, parentId]));
      await loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to add subtask');
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      await TaskStorageService.toggleTaskCompletion(taskId);
      await loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    console.log('Delete task called with ID:', taskId);
    
    // For web platform, use confirm instead of Alert.alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure? This will also delete all subtasks.');
      if (confirmed) {
        try {
          console.log('Proceeding with task deletion on web');
          await TaskStorageService.deleteTask(taskId);
          console.log('Task deleted, reloading tasks');
          
          // Force a fresh reload of tasks
          const freshTasks = await TaskStorageService.getTaskHierarchy();
          console.log('Fresh tasks loaded:', freshTasks.length);
          setTasks(freshTasks);
          
          console.log('Tasks state updated successfully');
        } catch (error) {
          console.error('Error deleting task on web:', error);
          window.alert('Failed to delete task: ' + (error instanceof Error ? error.message : String(error)));
        }
      }
    } else {
      Alert.alert(
        'Delete Task',
        'Are you sure? This will also delete all subtasks.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('Proceeding with task deletion on mobile');
                await TaskStorageService.deleteTask(taskId);
                console.log('Task deleted, reloading tasks');
                await loadTasks();
                console.log('Tasks reloaded successfully');
              } catch (error) {
                console.error('Error deleting task on mobile:', error);
                Alert.alert('Error', 'Failed to delete task');
              }
            },
          },
        ]
      );
    }
  };

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getSubtasks = (parentId: string): Task[] => {
    return tasks.filter(task => task.parentId === parentId);
  };

  const hasSubtasks = (taskId: string): boolean => {
    return tasks.some(task => task.parentId === taskId);
  };

  const renderTask = (task: Task, isVisible: boolean = true) => {
    if (!isVisible) return null;

    const subtasks = getSubtasks(task.id);
    const isExpanded = expandedTasks.has(task.id);
    const hasChildren = hasSubtasks(task.id);
    const indentLevel = task.level || 0;

    return (
      <View key={task.id}>
        <View 
          style={[
            styles.taskItem,
            isDarkMode && styles.taskItemDark,
            { marginLeft: indentLevel * 20 }
          ]}
        >
          {/* Expand/Collapse button */}
          {hasChildren && (
            <TouchableOpacity
              onPress={() => toggleExpanded(task.id)}
              style={styles.expandButton}
            >
              <Ionicons
                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={16}
                color={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
              />
            </TouchableOpacity>
          )}

          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => toggleTask(task.id)}
            style={styles.checkbox}
          >
            <Ionicons
              name={task.completed ? 'checkbox' : 'square-outline'}
              size={24}
              color={task.completed ? '#27ae60' : (isDarkMode ? '#bdc3c7' : '#7f8c8d')}
            />
          </TouchableOpacity>

          {/* Task title */}
          <Text
            style={[
              styles.taskTitle,
              isDarkMode && styles.taskTitleDark,
              task.completed && styles.taskTitleCompleted,
              { flex: 1 }
            ]}
          >
            {task.title}
          </Text>

          {/* Add subtask button */}
          <TouchableOpacity
            onPress={() => setAddingSubtaskTo(task.id)}
            style={styles.actionButton}
          >
            <Ionicons name="add" size={20} color={isDarkMode ? '#3498db' : '#2980b9'} />
          </TouchableOpacity>

          {/* Delete button */}
          <TouchableOpacity
            onPress={() => deleteTask(task.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={20} color={isDarkMode ? '#e74c3c' : '#c0392b'} />
          </TouchableOpacity>
        </View>

        {/* Add subtask input */}
        {addingSubtaskTo === task.id && (
          <View style={[styles.subtaskInput, { marginLeft: (indentLevel + 1) * 20 }]}>
            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              value={subtaskText}
              onChangeText={setSubtaskText}
              placeholder="Enter subtask..."
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              autoFocus
              onSubmitEditing={() => addSubtask(task.id)}
            />
            <TouchableOpacity
              onPress={() => addSubtask(task.id)}
              style={[styles.addButton, isDarkMode && styles.addButtonDark]}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setAddingSubtaskTo(null);
                setSubtaskText('');
              }}
              style={[styles.cancelButton, isDarkMode && styles.cancelButtonDark]}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Render subtasks */}
        {isExpanded && subtasks.map(subtask => renderTask(subtask, true))}
      </View>
    );
  };

  const mainTasks = tasks.filter(task => !task.parentId);

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>
          Work & Study Tasks
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
          Organize your tasks with unlimited subtasks
        </Text>
      </View>

      {/* Add new task */}
      <View style={[styles.addTaskContainer, isDarkMode && styles.addTaskContainerDark]}>
        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          value={newTaskText}
          onChangeText={setNewTaskText}
          placeholder="Add a new task..."
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          onSubmitEditing={addMainTask}
        />
        <TouchableOpacity
          onPress={addMainTask}
          style={[styles.addButton, isDarkMode && styles.addButtonDark]}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tasks list */}
      <FlatList
        data={mainTasks}
        renderItem={({ item }) => renderTask(item)}
        keyExtractor={(item) => item.id}
        style={styles.tasksList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerDark: {
    backgroundColor: '#2c3e50',
    borderBottomColor: '#34495e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  titleDark: {
    color: '#ecf0f1',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  subtitleDark: {
    color: '#bdc3c7',
  },
  addTaskContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  addTaskContainerDark: {
    backgroundColor: '#2c3e50',
    borderBottomColor: '#34495e',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  inputDark: {
    backgroundColor: '#34495e',
    borderColor: '#555',
    color: '#ecf0f1',
  },
  addButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    marginLeft: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDark: {
    backgroundColor: '#229954',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    marginLeft: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonDark: {
    backgroundColor: '#c0392b',
  },
  tasksList: {
    flex: 1,
    padding: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  taskItemDark: {
    backgroundColor: '#2c3e50',
  },
  expandButton: {
    marginRight: 8,
    padding: 4,
  },
  checkbox: {
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    color: '#2c3e50',
  },
  taskTitleDark: {
    color: '#ecf0f1',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  actionButton: {
    marginLeft: 8,
    padding: 4,
  },
  subtaskInput: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 16,
  },
});
