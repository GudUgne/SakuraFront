import { Component, OnInit } from '@angular/core';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-todo-widget',
  templateUrl: './todo-widget.component.html',
  imports: [
    MATERIAL_IMPORTS,
    FormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./todo-widget.component.css']
})
export class TodoWidgetComponent implements OnInit {
  tasks: { text: string; completed: boolean }[] = [];
  newTask: string = '';

  ngOnInit(): void {
    this.loadTasks();
  }

  addTask(): void {
    if (this.newTask.trim()) {
      this.tasks.push({ text: this.newTask, completed: false });
      this.newTask = '';
      this.saveTasks();
    }
  }

  toggleTask(index: number): void {
    this.tasks[index].completed = !this.tasks[index].completed;
    this.saveTasks();
  }

  deleteTask(index: number): void {
    this.tasks.splice(index, 1);
    this.saveTasks();
  }

  saveTasks(): void {
    localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
  }

  loadTasks(): void {
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
  }
}
