import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { LessonService, Lesson } from '../../services/lessons.service';
import {MatProgressBar} from '@angular/material/progress-bar';

interface ExerciseAttempt {
  exercise: any;
  studentAnswer: any;
  isCorrect?: boolean;
  showAnswer?: boolean;
}

@Component({
  selector: 'app-lesson-taking',
  standalone: true,
  imports: [CommonModule, FormsModule, MATERIAL_IMPORTS, MatProgressBar],
  templateUrl: './lesson-taking.component.html',
  styleUrls: ['./lesson-taking.component.css']
})
export class LessonTakingComponent implements OnInit {
  lesson: Lesson | null = null;
  exercises: ExerciseAttempt[] = [];
  currentExerciseIndex = 0;
  loading = true;
  isCompleted = false;
  score = 0;
  showResults = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: LessonService
  ) {}

  ngOnInit(): void {
    const lessonId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadLesson(lessonId);
  }

  loadLesson(id: number): void {
    this.lessonService.getLesson(id).subscribe({
      next: (lesson) => {
        this.lesson = lesson;
        this.initializeExercises();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading lesson:', err);
        this.loading = false;
      }
    });
  }

  initializeExercises(): void {
    if (!this.lesson?.exercises) return;

    this.exercises = this.lesson.exercises.map(exercise => ({
      exercise,
      studentAnswer: this.getEmptyAnswer(exercise.type),
      isCorrect: undefined,
      showAnswer: false
    }));

    // Shuffle exercises for variety (optional)
    // this.exercises = this.shuffleArray(this.exercises);
  }

  getEmptyAnswer(exerciseType: string): any {
    switch (exerciseType) {
      case 'freetext':
        return '';
      case 'multi-choice':
        return [];
      case 'pair-match':
        return {}; // Will store kanji -> meaning mappings
      default:
        return null;
    }
  }

  get currentExercise(): ExerciseAttempt | null {
    return this.exercises[this.currentExerciseIndex] || null;
  }

  get isLastExercise(): boolean {
    return this.currentExerciseIndex === this.exercises.length - 1;
  }

  get isFirstExercise(): boolean {
    return this.currentExerciseIndex === 0;
  }

  nextExercise(): void {
    if (!this.isLastExercise) {
      this.currentExerciseIndex++;
    }
  }

  previousExercise(): void {
    if (!this.isFirstExercise) {
      this.currentExerciseIndex--;
    }
  }

  goToExercise(index: number): void {
    this.currentExerciseIndex = index;
  }

  submitAnswer(): void {
    const current = this.currentExercise;
    if (!current) return;

    const isCorrect = this.checkAnswer(current);
    current.isCorrect = isCorrect;
    current.showAnswer = true;

    // Auto-advance after a short delay (optional)
    setTimeout(() => {
      if (!this.isLastExercise) {
        this.nextExercise();
      } else {
        this.finishLesson();
      }
    }, 2000);
  }

  checkAnswer(attempt: ExerciseAttempt): boolean {
    const { exercise, studentAnswer } = attempt;

    switch (exercise.type) {
      case 'freetext':
        return this.checkFreetextAnswer(exercise, studentAnswer);
      case 'multi-choice':
        return this.checkMultiChoiceAnswer(exercise, studentAnswer);
      case 'pair-match':
        return this.checkPairMatchAnswer(exercise, studentAnswer);
      default:
        return false;
    }
  }

  checkFreetextAnswer(exercise: any, studentAnswer: string): boolean {
    const correctAnswer = exercise.answer.toLowerCase().trim();
    const studentAnswerClean = studentAnswer.toLowerCase().trim();

    // Exact match
    if (studentAnswerClean === correctAnswer) {
      return true;
    }

    // Partial match (contains main keywords)
    const correctWords = correctAnswer.split(/\s+/);
    const studentWords = studentAnswerClean.split(/\s+/);

    // Consider correct if student answer contains 70% of the keywords
    const matches = correctWords.filter((word: string) =>
      studentWords.some((studentWord: string) => studentWord.includes(word) || word.includes(studentWord))
    );

    return matches.length >= Math.ceil(correctWords.length * 0.7);
  }

  checkMultiChoiceAnswer(exercise: any, selectedOptions: number[]): boolean {
    const correctOptions = exercise.options
      .filter((option: any) => option.is_correct)
      .map((option: any) => option.id);

    const selectedSet = new Set(selectedOptions);
    const correctSet = new Set(correctOptions);

    return selectedSet.size === correctSet.size &&
      [...selectedSet].every(id => correctSet.has(id));
  }

  checkPairMatchAnswer(exercise: any, studentAnswers: {[key: string]: string}): boolean {
    if (!exercise.pairs || !Array.isArray(exercise.pairs)) {
      return false;
    }

    let correctCount = 0;
    const totalPairs = exercise.pairs.length;

    for (const pair of exercise.pairs) {
      const studentAnswer = studentAnswers[pair.kanji]?.toLowerCase().trim() || '';
      const correctAnswer = pair.answer.toLowerCase().trim();

      if (studentAnswer === correctAnswer) {
        correctCount++;
      }
    }

    // Consider correct if student got at least 70% right
    return correctCount >= Math.ceil(totalPairs * 0.7);
  }

  finishLesson(): void {
    this.calculateScore();
    this.isCompleted = true;
    this.showResults = true;
  }

  calculateScore(): void {
    if (this.exercises.length === 0) {
      this.score = 0;
      return;
    }

    const correctAnswers = this.exercises.filter(ex => ex.isCorrect).length;
    this.score = Math.round((correctAnswers / this.exercises.length) * 100);
  }

  restartLesson(): void {
    this.currentExerciseIndex = 0;
    this.isCompleted = false;
    this.showResults = false;
    this.score = 0;

    this.exercises.forEach(exercise => {
      exercise.studentAnswer = this.getEmptyAnswer(exercise.exercise.type);
      exercise.isCorrect = undefined;
      exercise.showAnswer = false;
    });
  }

  goBackToLessons(): void {
    this.router.navigate(['/app/lessons']);
  }

  // Utility method to shuffle array (optional)
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Helper methods for templates
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  toggleOption(optionId: number): void {
    const current = this.currentExercise;
    if (!current || current.exercise.type !== 'multi-choice') return;

    const selected = current.studentAnswer as number[];
    const index = selected.indexOf(optionId);

    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(optionId);
    }
  }

  isOptionSelected(optionId: number): boolean {
    const current = this.currentExercise;
    if (!current || current.exercise.type !== 'multi-choice') return false;

    return (current.studentAnswer as number[]).includes(optionId);
  }

  // Helper methods for template expressions
  get isCurrentExerciseAnswered(): boolean {
    return this.currentExercise?.showAnswer || false;
  }

  get correctAnswersCount(): number {
    return this.exercises.filter(ex => ex.isCorrect === true).length;
  }

  get totalExercisesCount(): number {
    return this.exercises.length;
  }

  // Helper method to safely get student answer for pair match
  getPairMatchAnswer(kanji: string): string {
    const current = this.currentExercise;
    if (!current || current.exercise.type !== 'pair-match') return '';

    const answers = current.studentAnswer as {[key: string]: string};
    return answers[kanji] || '';
  }

  setPairMatchAnswer(kanji: string, value: string): void {
    const current = this.currentExercise;
    if (!current || current.exercise.type !== 'pair-match') return;

    const answers = current.studentAnswer as {[key: string]: string};
    answers[kanji] = value;
  }

  getAllPairMatchAnswers(): {[key: string]: string} {
    const current = this.currentExercise;
    if (!current || current.exercise.type !== 'pair-match') return {};

    return current.studentAnswer as {[key: string]: string};
  }

  setPairMatchAnswerForKanji(kanji: string, value: string): void {
    const current = this.currentExercise;
    if (!current || current.exercise.type !== 'pair-match') return;

    const answers = current.studentAnswer as {[key: string]: string};
    answers[kanji] = value;
  }

  getPairMatchAnswerForKanji(kanji: string): string {
    const answers = this.getAllPairMatchAnswers();
    return answers[kanji] || '';
  }
}
