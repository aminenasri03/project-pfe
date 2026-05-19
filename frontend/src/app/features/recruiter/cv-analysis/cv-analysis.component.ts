import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CvAnalysisService } from '../../../core/services/cv-analysis.service';
import { CvAnalysisResponse } from '../../../core/models/cv-analysis.model';

@Component({
  selector: 'app-cv-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cv-analysis.component.html',
  styleUrl: './cv-analysis.component.scss'
})
export class CvAnalysisComponent {
  cvFile: File | null = null;
  cvFileName = '';
  jobDescription = '';
  result: CvAnalysisResponse | null = null;
  loading = false;
  error = '';

  constructor(private cvAnalysisService: CvAnalysisService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.cvFile = input.files[0];
      this.cvFileName = this.cvFile.name;
    }
  }

  analyze() {
    if (!this.cvFile) {
      this.error = 'Veuillez sélectionner un fichier CV (PDF, DOC ou DOCX).';
      return;
    }
    if (!this.jobDescription.trim()) {
      this.error = 'Veuillez remplir la description du poste.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.result = null;

    this.cvAnalysisService.analyze(this.cvFile, this.jobDescription).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'analyse. Veuillez réessayer.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
