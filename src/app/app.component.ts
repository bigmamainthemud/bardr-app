import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'bardr-app';
  transcription: string = 'Waiting for transcription...';

  private mediaRecorder!: MediaRecorder;
  private isRecording: boolean = false;
  private audioChunks: BlobPart[] = [];

  constructor(private http: HttpClient, private ngZone: NgZone) {}

  startRecording(): void {
    if (!this.isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          this.mediaRecorder = new MediaRecorder(stream);
          this.mediaRecorder.start();

          this.mediaRecorder.ondataavailable = (event) => {
            this.audioChunks.push(event.data);
          };

          this.isRecording = true;
        })
        .catch(error => console.error(error));
    }
  }

  stopRecording(): void {
    if (this.isRecording) {
      this.mediaRecorder.stop();
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 'type' : 'audio/ogg; codecs=opus' });
        this.sendAudioToServer(audioBlob);
        this.audioChunks = [];
        this.isRecording = false;
      };
    }
  }

  private sendAudioToServer(audioBlob: Blob): void {
    // console.log('Audio Blob Type:', audioBlob.type); 
    // console.log('Audio Blob Size:', audioBlob.size); 

    const formData = new FormData();
    formData.append('audio', audioBlob);

    const blobSlice = audioBlob.slice(0, 100); 
    const reader = new FileReader();
    reader.onloadend = function() {
        const base64data = reader.result;  
        // console.log('Sample Base64 Data:', base64data); 
    };
    reader.readAsDataURL(blobSlice);

    this.http.post('http://localhost:3000/transcribe', formData).subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          this.transcription = response.transcription || 'Transcription blank';
          console.log('Transcription:', this.transcription);
        });
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
}

  
}