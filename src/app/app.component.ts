import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AudioContextModule } from 'angular-audio-context';
import { SafeHtmlPipe } from './safe-html.pipe';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AudioContextModule, SafeHtmlPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  @ViewChild('transcriptionBox') transcriptionBox: ElementRef;

  title = 'bardr-app';
  messageHistory: string[] = [];
  transcription: string = 'Any questions?';
  aiResponse: string = '';

  private mediaRecorder!: MediaRecorder;
  private isRecording: boolean = false;
  private audioChunks: BlobPart[] = [];
  
  constructor(private http: HttpClient, private ngZone: NgZone, private elRef: ElementRef) {
    this.transcriptionBox = elRef;
    gsap.registerPlugin(ScrollToPlugin);
  }

  startRecording(): void {
    if (!this.isRecording) {
      const constraints = {
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true
        }
      };

      navigator.mediaDevices.getUserMedia( constraints )
      .then(stream => {
        let options = { mimeType: 'audio/webm; codecs=pcm' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'default' }; 
        }
      
        this.mediaRecorder = new MediaRecorder(stream, options);
        this.mediaRecorder.start();
        this.isRecording = true;

        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data);
        };
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
    const formData = new FormData();
    formData.append('audio', audioBlob);
  
    this.http.post('http://localhost:3000/transcribe', formData).subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          this.messageHistory.push('<b>YOU:</b><br><br>'+response.transcription);
          console.log('Message history:', response.transcription);
          
          this.getAiResponse(response.transcription);

          const lastElement = this.transcriptionBox.nativeElement.querySelector('li:last-child');
          if (lastElement) { gsap.to('.transcription-box', { scrollTo: { y: lastElement } }); }
          else { console.warn('No last element found in transcription box'); }

        });
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }
  
  private getAiResponse(transcription: string): void {
    console.log('getAIResponse '+transcription);
    this.http.post('http://localhost:3000/ai-response', { transcription: transcription }).subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          this.messageHistory.push('<b>AI:</b> '+response.aiResponse);
          console.log('Updated message history:', response.aiResponse);
          
          const lastElement = this.transcriptionBox.nativeElement.querySelector('li:last-child');
          if (lastElement) { gsap.to('.transcription-box', { scrollTo: { y: lastElement } }); }
          else { console.warn('No last element found in transcription box'); }
        });
      },
      error: (error) => console.error('Error:', error)
    });
  }
  

  // private playRecording(audioBlob){
  //   const audioUrl = URL.createObjectURL(audioBlob);
  //   const audio = new Audio(audioUrl);
  //   audio.controls = true;
  //   document.body.appendChild(audio);
  //   audio.play();
  //   console.log('Audio Blob Type:', audioBlob.type); 
  //   console.log('Audio Blob Size:', audioBlob.size); 
  // }




}


