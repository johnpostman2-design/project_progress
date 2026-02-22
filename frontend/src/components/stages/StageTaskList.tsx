import React from 'react'
import { Task, sortTasksForDisplay } from '../../models/task'

interface StageTaskListProps {
  tasks: Task[]
  className?: string
}

export const StageTaskList: React.FC<StageTaskListProps> = ({ tasks, className = '' }) => {
  if (tasks.length === 0) {
    return <div className={`stage-task-list empty ${className}`}>Нет задач</div>
  }

  const sortedTasks = sortTasksForDisplay(tasks)

  return (
    <div className={`stage-task-list ${className}`}>
      <h3>Задачи из Kaiten:</h3>
      <ul>
        {sortedTasks.map((task) => (
          <li key={task.id} className={task.isCompleted ? 'completed' : 'active'}>
            <span className="task-title">{task.title}</span>
            <span className="task-status">
              {task.isCompleted ? '✓ Выполнено' : '○ В работе'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
