'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle, Clock, AlertCircle, Phone, Mail, MessageSquare,
  Calendar, FileText, Target, Users, Play, Check, Eye,
  TrendingUp, Award, Zap, Search
} from 'lucide-react';

type Task = {
  id: string;
  type: 'call' | 'email' | 'sms' | 'appointment' | 'proposal' | 'follow-up' | 'lead-review';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  dueTime?: string;
  assignedBy: string;
  assignedTo: string;
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  leadScore?: number;
  estimatedTime?: string;
};

export default function MyWorkPage() {
  const [activeTab, setActiveTab] = useState<'assigned' | 'available' | 'completed'>('assigned');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterType, setFilterType] = useState<'all' | 'call' | 'email' | 'sms' | 'appointment' | 'proposal' | 'follow-up' | 'lead-review'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Mock tasks data - Tasks assigned to current user
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([
    {
      id: '1',
      type: 'call',
      title: 'Follow-up call with Sarah Martinez',
      description: 'Discuss proposal details and answer questions about Ultra Flow package',
      priority: 'high',
      status: 'pending',
      dueDate: 'Today',
      dueTime: '2:00 PM',
      assignedBy: 'Mike Chen',
      assignedTo: 'me',
      leadName: 'Sarah Martinez',
      leadEmail: 'sarah@techsolutions.com',
      leadPhone: '+1 (555) 123-4567',
      leadScore: 94,
      estimatedTime: '15 mins'
    },
    {
      id: '2',
      type: 'proposal',
      title: 'Create proposal for Tech Solutions Inc',
      description: 'Enterprise package with custom integrations - CRM sync, API access, dedicated support',
      priority: 'high',
      status: 'in-progress',
      dueDate: 'Today',
      dueTime: '5:00 PM',
      assignedBy: 'Admin',
      assignedTo: 'me',
      leadName: 'Tech Solutions Inc',
      leadEmail: 'contact@techsolutions.com',
      leadScore: 88,
      estimatedTime: '30 mins'
    },
    {
      id: '3',
      type: 'email',
      title: 'Send follow-up email to 5 warm leads',
      description: 'Campaign: Spring Promotion 2024 - Offer 20% discount on first 3 months',
      priority: 'medium',
      status: 'pending',
      dueDate: 'Tomorrow',
      dueTime: '10:00 AM',
      assignedBy: 'Sarah Johnson',
      assignedTo: 'me',
      estimatedTime: '20 mins'
    },
    {
      id: '4',
      type: 'appointment',
      title: 'Demo call with Jennifer Wong',
      description: 'Product walkthrough and Q&A session - Show Journey Builder and AI Voice features',
      priority: 'high',
      status: 'pending',
      dueDate: 'Tomorrow',
      dueTime: '3:00 PM',
      assignedBy: 'System',
      assignedTo: 'me',
      leadName: 'Jennifer Wong',
      leadEmail: 'jennifer@startup.io',
      leadPhone: '+1 (555) 987-6543',
      leadScore: 76,
      estimatedTime: '45 mins'
    },
    {
      id: '5',
      type: 'lead-review',
      title: 'Review and qualify 12 new leads',
      description: 'From Facebook campaign - requires scoring and assignment to sales pipeline',
      priority: 'medium',
      status: 'pending',
      dueDate: 'Dec 12, 2024',
      dueTime: '11:00 AM',
      assignedBy: 'Mike Chen',
      assignedTo: 'me',
      estimatedTime: '1 hour'
    },
    {
      id: '6',
      type: 'sms',
      title: 'Send appointment reminders',
      description: '8 customers with appointments tomorrow - Include meeting link and prep instructions',
      priority: 'low',
      status: 'pending',
      dueDate: 'Dec 11, 2024',
      dueTime: '4:00 PM',
      assignedBy: 'System',
      assignedTo: 'me',
      estimatedTime: '10 mins'
    },
    {
      id: '7',
      type: 'follow-up',
      title: 'Follow up with cold leads',
      description: '15 leads from last month to re-engage - Use new holiday promotion campaign',
      priority: 'low',
      status: 'overdue',
      dueDate: '2 days ago',
      assignedBy: 'Sarah Johnson',
      assignedTo: 'me',
      estimatedTime: '25 mins'
    }
  ]);

  // Tasks available for pickup (not assigned to anyone)
  const [availableTasks] = useState<Task[]>([
    {
      id: '8',
      type: 'call',
      title: 'Inbound call - David Miller',
      description: 'Interested in Smart Flow package, requested callback',
      priority: 'high',
      status: 'pending',
      dueDate: 'Today',
      dueTime: 'ASAP',
      assignedBy: 'System',
      assignedTo: '',
      leadName: 'David Miller',
      leadEmail: 'david@company.com',
      leadPhone: '+1 (555) 234-5678',
      leadScore: 82,
      estimatedTime: '15 mins'
    },
    {
      id: '9',
      type: 'lead-review',
      title: 'Qualify 8 LinkedIn leads',
      description: 'New leads from LinkedIn campaign - need initial scoring',
      priority: 'medium',
      status: 'pending',
      dueDate: 'Tomorrow',
      assignedBy: 'Mike Chen',
      assignedTo: '',
      estimatedTime: '30 mins'
    },
    {
      id: '10',
      type: 'email',
      title: 'Welcome email sequence',
      description: 'Send to 20 new trial signups from this week',
      priority: 'low',
      status: 'pending',
      dueDate: 'Dec 12, 2024',
      assignedBy: 'Sarah Johnson',
      assignedTo: '',
      estimatedTime: '15 mins'
    }
  ]);

  // Completed tasks
  const [completedTasks] = useState<Task[]>([
    {
      id: '11',
      type: 'call',
      title: 'Follow-up call with David Kim',
      description: 'Discussed pricing and features',
      priority: 'high',
      status: 'completed',
      dueDate: 'Today',
      dueTime: '10:00 AM',
      assignedBy: 'Admin',
      assignedTo: 'me',
      leadName: 'David Kim',
      leadScore: 90,
      estimatedTime: '15 mins'
    },
    {
      id: '12',
      type: 'proposal',
      title: 'Sent proposal to ABC Corp',
      description: 'Enterprise package proposal',
      priority: 'high',
      status: 'completed',
      dueDate: 'Yesterday',
      assignedBy: 'Mike Chen',
      assignedTo: 'me',
      estimatedTime: '30 mins'
    },
    {
      id: '13',
      type: 'email',
      title: 'Follow-up campaign emails',
      description: 'Sent to 25 warm leads',
      priority: 'medium',
      status: 'completed',
      dueDate: 'Yesterday',
      assignedBy: 'Sarah Johnson',
      assignedTo: 'me',
      estimatedTime: '20 mins'
    }
  ]);

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'appointment': return Calendar;
      case 'proposal': return FileText;
      case 'follow-up': return Target;
      case 'lead-review': return Users;
      default: return CheckCircle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-orange-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    };
    return styles[priority as keyof typeof styles];
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles];
  };

  const handleStartTask = (taskId: string) => {
    setAssignedTasks(assignedTasks.map(task =>
      task.id === taskId ? { ...task, status: 'in-progress' as const } : task
    ));
  };

  const handleCompleteTask = (taskId: string) => {
    setAssignedTasks(assignedTasks.map(task =>
      task.id === taskId ? { ...task, status: 'completed' as const } : task
    ));
  };

  const handlePickupTask = (task: Task) => {
    const newTask = { ...task, assignedTo: 'me' };
    setAssignedTasks([...assignedTasks, newTask]);
  };

  const getCurrentTasks = () => {
    let tasks: Task[] = [];
    if (activeTab === 'assigned') tasks = assignedTasks.filter(t => t.status !== 'completed');
    if (activeTab === 'available') tasks = availableTasks;
    if (activeTab === 'completed') tasks = completedTasks;

    if (filterPriority !== 'all') {
      tasks = tasks.filter(t => t.priority === filterPriority);
    }
    if (filterType !== 'all') {
      tasks = tasks.filter(t => t.type === filterType);
    }
    if (searchQuery) {
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.leadName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return tasks;
  };

  const filteredTasks = getCurrentTasks();

  const stats = {
    totalAssigned: assignedTasks.filter(t => t.status !== 'completed').length,
    pending: assignedTasks.filter(t => t.status === 'pending').length,
    inProgress: assignedTasks.filter(t => t.status === 'in-progress').length,
    overdue: assignedTasks.filter(t => t.status === 'overdue').length,
    completedToday: completedTasks.length,
    available: availableTasks.length
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Work</h1>
        <p className="text-gray-600">Manage your assigned tasks and pick up new work</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalAssigned}</div>
              <div className="text-xs text-gray-500">My Tasks</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{stats.pending}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{stats.inProgress}</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{stats.overdue}</div>
              <div className="text-xs text-gray-500">Overdue</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{stats.completedToday}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{stats.available}</div>
              <div className="text-xs text-gray-500">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-6 py-3 border-b-2 transition-all flex items-center gap-2 text-sm font-medium ${
            activeTab === 'assigned'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          My Assigned Tasks ({stats.totalAssigned})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-3 border-b-2 transition-all flex items-center gap-2 text-sm font-medium ${
            activeTab === 'available'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="w-4 h-4" />
          Available Tasks ({stats.available})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-3 border-b-2 transition-all flex items-center gap-2 text-sm font-medium ${
            activeTab === 'completed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Check className="w-4 h-4" />
          Completed ({completedTasks.length})
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="call">📞 Calls</option>
              <option value="email">✉️ Emails</option>
              <option value="sms">💬 SMS</option>
              <option value="appointment">📅 Appointments</option>
              <option value="proposal">📄 Proposals</option>
              <option value="follow-up">🎯 Follow-ups</option>
              <option value="lead-review">👥 Lead Reviews</option>
            </select>
          </div>
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredTasks.length} tasks
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'assigned' && 'You have no assigned tasks at the moment'}
              {activeTab === 'available' && 'No tasks available to pick up'}
              {activeTab === 'completed' && "You haven't completed any tasks yet"}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const Icon = getTaskIcon(task.type);
            return (
              <motion.div
                key={task.id}
                whileHover={{ scale: 1.005 }}
                className="bg-white rounded-xl shadow-xs border border-gray-200 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="flex">
                  {/* Priority Indicator */}
                  <div className={`w-2 bg-gradient-to-b ${getPriorityColor(task.priority)}`} />

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        task.priority === 'high' ? 'bg-red-50' :
                        task.priority === 'medium' ? 'bg-yellow-50' :
                        'bg-green-50'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          task.priority === 'high' ? 'text-red-600' :
                          task.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`} />
                      </div>

                      {/* Task Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                              {task.priority.toUpperCase()}
                            </span>
                            {task.status && (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                                {task.status.replace('-', ' ').toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Lead Info */}
                        {task.leadName && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium text-gray-900">{task.leadName}</div>
                              {task.leadScore && (
                                <div className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                                  Score: {task.leadScore}
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              {task.leadEmail && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {task.leadEmail}
                                </div>
                              )}
                              {task.leadPhone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {task.leadPhone}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Due: {task.dueDate} {task.dueTime && `at ${task.dueTime}`}
                          </div>
                          {task.estimatedTime && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Est: {task.estimatedTime}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Assigned by: {task.assignedBy}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {activeTab === 'assigned' && (
                            <>
                              {task.status === 'pending' && (
                                <button
                                  onClick={() => handleStartTask(task.id)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium flex items-center gap-2"
                                >
                                  <Play className="w-4 h-4" />
                                  Start Task
                                </button>
                              )}
                              {task.status === 'in-progress' && (
                                <button
                                  onClick={() => handleCompleteTask(task.id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium flex items-center gap-2"
                                >
                                  <Check className="w-4 h-4" />
                                  Mark Complete
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedTask(task)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                            </>
                          )}
                          {activeTab === 'available' && (
                            <button
                              onClick={() => handlePickupTask(task)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                            >
                              <Target className="w-4 h-4" />
                              Pick Up Task
                            </button>
                          )}
                          {activeTab === 'completed' && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Performance Highlight */}
      {stats.completedToday > 0 && (
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Great Work Today! 🎉</h3>
              <p className="text-sm text-gray-600">
                You&apos;ve completed {stats.completedToday} task{stats.completedToday > 1 ? 's' : ''} today. Keep up the excellent work!
              </p>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">+{stats.completedToday * 10} points</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
