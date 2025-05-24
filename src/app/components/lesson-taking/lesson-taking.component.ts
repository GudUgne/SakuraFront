import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { LessonService, Lesson } from '../../services/lessons.service';
import { HomeworkService } from '../../services/homework.service';
import { MatProgressBar } from '@angular/material/progress-bar';

interface ExerciseAttempt {
  exercise: any;
  studentAnswer: any;
  isCorrect?: boolean;
  showAnswer?: boolean;
  shuffledMeanings?: any[]; // For pair-match exercises
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
  showResults = false;
  score = 0;

  // Pair-match specific properties
  selectedKanji: string | null = null;
  selectedMeaning: string | null = null;

  homeworkId: number | null = null;
  isHomeworkMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: LessonService,
    private homeworkService: HomeworkService
  ) {}

  ngOnInit(): void {
    const lessonId = Number(this.route.snapshot.paramMap.get('id'));

    // Check if this is homework mode
    this.route.queryParams.subscribe(params => {
      this.homeworkId = params['homework'] ? Number(params['homework']) : null;
      this.isHomeworkMode = !!this.homeworkId;
    });

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
      showAnswer: false,
      shuffledMeanings: exercise.type === 'pair-match' && exercise.pairs
        ? this.shuffleArray([...exercise.pairs])
        : undefined
    }));
  }

  getEmptyAnswer(exerciseType: string): any {
    switch (exerciseType) {
      case 'freetext':
        return '';
      case 'multi-choice':
        return [];
      case 'pair-match':
        return { matches: [] };
      default:
        return null;
    }
  }

  // Navigation methods
  get currentExercise(): ExerciseAttempt | null {
    return this.exercises[this.currentExerciseIndex] || null;
  }

  get isLastExercise(): boolean {
    return this.currentExerciseIndex === this.exercises.length - 1;
  }

  get isFirstExercise(): boolean {
    return this.currentExerciseIndex === 0;
  }

  get isCurrentExerciseAnswered(): boolean {
    return this.currentExercise?.showAnswer || false;
  }

  nextExercise(): void {
    if (!this.isLastExercise) {
      this.currentExerciseIndex++;
      this.clearPairMatchSelections();
    }
  }

  previousExercise(): void {
    if (!this.isFirstExercise) {
      this.currentExerciseIndex--;
      this.clearPairMatchSelections();
    }
  }

  goToExercise(index: number): void {
    this.currentExerciseIndex = index;
    this.clearPairMatchSelections();
  }

  // Pair-match methods
  selectKanji(kanji: string): void {
    if (this.isCurrentExerciseAnswered || this.isPairMatched(kanji)) return;

    this.selectedKanji = this.selectedKanji === kanji ? null : kanji;

    // Auto-match if both are selected
    if (this.selectedKanji && this.selectedMeaning && !this.isMeaningMatched(this.selectedMeaning)) {
      this.makeMatch();
    }
  }

  selectMeaning(meaning: string): void {
    if (this.isCurrentExerciseAnswered || this.isMeaningMatched(meaning)) return;

    this.selectedMeaning = this.selectedMeaning === meaning ? null : meaning;

    // Auto-match if both are selected
    if (this.selectedKanji && this.selectedMeaning && !this.isPairMatched(this.selectedKanji)) {
      this.makeMatch();
    }
  }

  makeMatch(): void {
    if (!this.selectedKanji || !this.selectedMeaning || this.isCurrentExerciseAnswered) return;

    const current = this.currentExercise;
    if (!current || current.exercise.type !== 'pair-match') return;

    const answers = current.studentAnswer as { matches: {kanji: string, meaning: string}[] };

    answers.matches.push({
      kanji: this.selectedKanji,
      meaning: this.selectedMeaning
    });

    this.clearPairMatchSelections();
  }

  clearPairMatchSelections(): void {
    this.selectedKanji = null;
    this.selectedMeaning = null;
  }

  isPairMatched(kanji: string): boolean {
    const current = this.currentExercise;
    if (!current || current.exercise.type !== 'pair-match') return false;

    const answers = current.studentAnswer as { matches: {kanji: string, meaning: string}[] };
    return answers.matches.some(match => match.kanji === kanji);
  }

  isMeaningMatched(meaning: string): boolean {
    const current = this.currentExercise;
    if (!current || current.exercise.type !== 'pair-match') return false;

    const answers = current.studentAnswer as { matches: {kanji: string, meaning: string}[] };
    return answers.matches.some(match => match.meaning === meaning);
  }

  getMatchedPairs(): {kanji: string, meaning: string}[] {
    const current = this.currentExercise;
    if (!current || current.exercise.type !== 'pair-match') return [];

    const answers = current.studentAnswer as { matches: {kanji: string, meaning: string}[] };
    return answers.matches || [];
  }

  getShuffledMeanings(): any[] {
    const current = this.currentExercise;
    if (!current || current.exercise.type !== 'pair-match') return [];

    return current.shuffledMeanings || [];
  }

  isMatchCorrect(kanji: string, meaning: string): boolean {
    const current = this.currentExercise;
    if (!current || current.exercise.type !== 'pair-match') return false;

    const correctPair = current.exercise.pairs?.find((pair: any) => pair.kanji === kanji);
    return correctPair?.answer === meaning;
  }

  // Multi-choice methods
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

  // Answer checking
  submitAnswer(): void {
    const current = this.currentExercise;
    if (!current) return;

    // Validate pair-match completion
    if (current.exercise.type === 'pair-match') {
      const answers = current.studentAnswer as { matches: {kanji: string, meaning: string}[] };
      const totalPairs = current.exercise.pairs?.length || 0;
      const matchedPairs = answers.matches?.length || 0;

      if (matchedPairs < totalPairs) {
        alert(`Please match all ${totalPairs} pairs before submitting. You have matched ${matchedPairs}.`);
        return;
      }
    }

    const isCorrect = this.checkAnswer(current);
    current.isCorrect = isCorrect;
    current.showAnswer = true;

    this.clearPairMatchSelections();
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

    const matches = correctWords.filter((word: string) =>
      studentWords.some((studentWord: string) =>
        studentWord.includes(word) || word.includes(studentWord)
      )
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

  checkPairMatchAnswer(exercise: any, studentAnswers: { matches: {kanji: string, meaning: string}[] }): boolean {
    if (!exercise.pairs || !Array.isArray(exercise.pairs)) {
      return false;
    }

    const matches = studentAnswers.matches || [];

    // Check if all pairs are matched
    if (matches.length !== exercise.pairs.length) {
      return false;
    }

    // Check if all matches are correct
    let correctCount = 0;
    for (const match of matches) {
      const correctPair = exercise.pairs.find((pair: any) => pair.kanji === match.kanji);
      if (correctPair && correctPair.answer === match.meaning) {
        correctCount++;
      }
    }

    // Require 100% correct for pair matching
    return correctCount === exercise.pairs.length;
  }

  finishLesson(): void {
    this.calculateScore();

    if (this.isHomeworkMode && this.homeworkId) {
      // Submit homework result
      this.homeworkService.submitHomeworkResult(this.homeworkId, this.score).subscribe({
        next: (result) => {
          console.log('Homework submitted:', result);
          this.showResults = true;
        },
        error: (err) => {
          console.error('Error submitting homework:', err);
          // Still show results even if submission fails
          this.showResults = true;
          alert('Your lesson is complete, but there was an error submitting your homework score. Please contact your teacher.');
        }
      });
    } else {
      this.showResults = true;
    }
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
    this.showResults = false;
    this.score = 0;
    this.clearPairMatchSelections();

    this.exercises.forEach(exercise => {
      exercise.studentAnswer = this.getEmptyAnswer(exercise.exercise.type);
      exercise.isCorrect = undefined;
      exercise.showAnswer = false;

      // Re-shuffle meanings for pair-match exercises
      if (exercise.exercise.type === 'pair-match' && exercise.exercise.pairs) {
        exercise.shuffledMeanings = this.shuffleArray([...exercise.exercise.pairs]);
      }
    });
  }

  goBackToLessons(): void {
    if (this.isHomeworkMode) {
      this.router.navigate(['/app/homework']);
    } else {
      this.router.navigate(['/app/lessons']);
    }
  }

  // Helper methods
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  get correctAnswersCount(): number {
    return this.exercises.filter(ex => ex.isCorrect === true).length;
  }

  get totalExercisesCount(): number {
    return this.exercises.length;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
