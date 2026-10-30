import { Component, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../core/services/upload.service';
import { ProcessingResponse, FileProcessingResult } from '../../models/transaction.model';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { AlertComponent } from '../../shared/alert/alert.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, AlertComponent, PageHeaderComponent],
  template: `
    <app-page-header
      title="Cargar archivos"
      subtitle="Selecciona o arrastra archivos JSON o TXT con datos en formato JSON."
    />

    <!-- Zona de drop -->
    <div
      (dragover)="onDragOver($event)"
      (dragleave)="dragging.set(false)"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
      [class.border-blue-500]="dragging()"
      [class.bg-blue-50]="dragging()"
      class="border-2 border-dashed border-gray-300 rounded-xl p-10
             flex flex-col items-center justify-center gap-3 cursor-pointer
             hover:border-blue-400 hover:bg-gray-50 transition-colors mb-5"
      role="button"
      tabindex="0"
      aria-label="Área para arrastrar archivos JSON"
      (keydown.enter)="fileInput.click()"
    >
      <span class="text-4xl" aria-hidden="true">📁</span>
      <p class="text-sm font-medium text-gray-600">
        Arrastra archivos aquí o <span class="text-blue-600 underline">selecciónalos</span>
      </p>
      <p class="text-xs text-gray-400">Archivos .json o .txt con formato JSON · Máximo 10 MB por archivo</p>
      <input
        #fileInput
        type="file"
        multiple
        accept=".json,.txt,application/json,text/plain"
        class="hidden"
        (change)="onFileSelect($event)"
        aria-label="Selector de archivos"
      />
    </div>

    <!-- Lista de archivos seleccionados -->
    <ul *ngIf="selectedFiles().length > 0" class="space-y-2 mb-5">
      <li
        *ngFor="let f of selectedFiles(); let i = index"
        class="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span aria-hidden="true">📄</span>
          <span class="truncate font-medium text-gray-800">{{ f.name }}</span>
          <span class="text-gray-400 shrink-0">({{ formatSize(f.size) }})</span>
        </div>
        <button
          (click)="removeFile(i)"
          class="ml-3 text-gray-300 hover:text-red-500 transition-colors text-lg leading-none shrink-0"
          [attr.aria-label]="'Eliminar ' + f.name"
        >×</button>
      </li>
    </ul>

    <!-- Acciones -->
    <div class="flex gap-3 mb-6">
      <button
        (click)="process()"
        [disabled]="selectedFiles().length === 0 || uploading()"
        class="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium
               hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors flex items-center gap-2"
      >
        <span *ngIf="uploading()">⏳</span>
        {{ uploading() ? 'Procesando...' : 'Procesar archivos' }}
      </button>
      <button
        *ngIf="selectedFiles().length > 0 && !uploading()"
        (click)="clearSelection()"
        class="text-sm text-gray-500 hover:text-gray-700 px-3"
      >
        Limpiar selección
      </button>
    </div>

    <!-- Spinner -->
    <app-spinner *ngIf="uploading()" message="Enviando y procesando archivos..." />

    <!-- Error global -->
    <app-alert
      *ngIf="uploadError()"
      type="error"
      title="Error al procesar"
      [message]="uploadError()!"
    />

    <!-- Resultados por archivo -->
    <ng-container *ngIf="result()">
      <h2 class="text-base font-semibold text-gray-800 mb-3">Resultado del procesamiento</h2>

      <!-- Resumen global -->
      <div class="grid grid-cols-2 gap-4 mb-5">
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-green-700">{{ result()!.total_valid }}</p>
          <p class="text-sm text-green-600 mt-0.5">Válidas</p>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-red-700">{{ result()!.total_invalid }}</p>
          <p class="text-sm text-red-600 mt-0.5">Inválidas</p>
        </div>
      </div>

      <!-- Detalle por archivo -->
      <div class="space-y-3">
        <div
          *ngFor="let fr of result()!.files"
          class="bg-white border rounded-xl p-4 shadow-sm"
          [class.border-red-200]="fr.errors.length > 0"
          [class.border-gray-200]="fr.errors.length === 0"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <p class="font-medium text-gray-800 text-sm truncate">📄 {{ fr.filename }}</p>
            <span
              class="text-xs px-2 py-0.5 rounded-full shrink-0"
              [class.bg-green-100]="fr.errors.length === 0"
              [class.text-green-700]="fr.errors.length === 0"
              [class.bg-red-100]="fr.errors.length > 0"
              [class.text-red-700]="fr.errors.length > 0"
            >
              {{ fr.errors.length === 0 ? '✓ OK' : '✗ Error de archivo' }}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div>Encontrados: <strong>{{ fr.records_found }}</strong></div>
            <div>Válidos: <strong class="text-green-700">{{ fr.valid }}</strong></div>
            <div>Inválidos: <strong class="text-red-700">{{ fr.invalid }}</strong></div>
          </div>

          <ul *ngIf="fr.errors.length > 0" class="mt-2 space-y-1">
            <li
              *ngFor="let e of fr.errors"
              class="text-xs text-red-600 bg-red-50 rounded px-2 py-1"
            >{{ e }}</li>
          </ul>
        </div>
      </div>
    </ng-container>
  `,
})
export class UploadComponent {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  selectedFiles = signal<File[]>([]);
  uploading = signal(false);
  uploadError = signal<string | null>(null);
  result = signal<ProcessingResponse | null>(null);
  dragging = signal(false);

  constructor(private uploadService: UploadService) {}

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []).filter(
      (f) =>       f.type === 'application/json' ||
      f.name.toLowerCase().endsWith('.json') ||
      f.name.toLowerCase().endsWith('.txt')
    );
    this.addFiles(files);
  }

  private addFiles(files: File[]): void {
    const current = this.selectedFiles();
    const existing = new Set(current.map((f) => f.name));
    const unique = files.filter((f) => !existing.has(f.name));
    this.selectedFiles.set([...current, ...unique]);
  }

  removeFile(index: number): void {
    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
  }

  clearSelection(): void {
    this.selectedFiles.set([]);
    this.result.set(null);
    this.uploadError.set(null);
  }

  process(): void {
    if (this.selectedFiles().length === 0) return;
    this.uploading.set(true);
    this.uploadError.set(null);
    this.result.set(null);

    this.uploadService.uploadFiles(this.selectedFiles()).subscribe({
      next: (data) => {
        this.result.set(data);
        this.uploading.set(false);
        this.selectedFiles.set([]);
      },
      error: (err: Error) => {
        this.uploadError.set(err.message);
        this.uploading.set(false);
      },
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
