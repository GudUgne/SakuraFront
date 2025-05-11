import { Component, OnInit } from '@angular/core';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {AuthService, User} from '../../services/auth.service';

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
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.loadTasks();
    });
  }

  addTask(): void {
    if (this.newTask.trim()) {
      this.tasks.push({ text: this.newTask, completed: false });
      this.newTask = '';
      this.saveTasks();
    }
  }

  deleteTask(index: number): void {
    this.tasks.splice(index, 1);
    this.saveTasks();
  }

  saveTasks(): void {
    if (!this.currentUser) return;
    localStorage.setItem(`todoTasks-${this.currentUser.username}`, JSON.stringify(this.tasks));
  }

  loadTasks(): void {
    if (!this.currentUser) return;
    const savedTasks = localStorage.getItem(`todoTasks-${this.currentUser.username}`);
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
  }
}
