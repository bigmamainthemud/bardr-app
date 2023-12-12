import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SpeechClient } from '@google-cloud/speech';

const speechClient = new SpeechClient({
    "type": "service_account",
    "project_id": "bardr-ring",
    "private_key_id": "da6f0b90fee61694d2d232c513670ccaacead906",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC/2JXSGkdAaGIH\n8nGWFxfQ7IGu/lRaJ2dlth3ZBH7If1qBUMDFJ7AuAg4dudCLzp+Jpc2nwQFiTW1F\n9mEkqdC7Kjrn/GA2uUjYtZf4Dm9U/Q2cNmU7AuP9mC5NByY6n2mwVk8mVnhXPHDg\nYxLX4xmSBOAgUCHBMn3peoDHlKaUJfVX04ZkbxSH4kd8EgyaF2BlrfBxMNgsfvmk\ngz4h7ROhT5m/1CvSPmq7F/L7drP162JXsQ7v7j6R3k3qmQ/mgqWLTNF3G5jIV9SM\nlS8skPFGlHbo84qvZkCLlembwe6ylKYQKcdCVlcQ2sfFdwVpm0ncnwJQUPsAULD6\noDNlq5S/AgMBAAECggEAUWk0stMp92AUcbDlmL62AZfLtJoC67sa+qOc6PIqZyT8\nIDJHi6K69dszaFPo9ts5Am2U5yJVVwTqYS0brjZN+I8ELlv/7FkWW7g8BC0D+7nj\nI65FqRQh8gS5aUCmbWwmqokFz4wUR1jDwcTpQyoBOODOx4eZu2WU3xZ4PbmMMwNm\ntGGyrEY8GpAHPqI+OEG4vK818uqIvg+tHLbvGUfg8hT67BnrzGghxAAhSPBvoGxr\nMDTDflTQMbL1NHSl47FX5/wNk7D2THExmtvBhwWqDQdG2vbZZk7xgMR5Ndzq79AD\nm/sxR50iM7/4uHHnxkyjqsQP/GlQvOhxteW990qBMQKBgQD/G40Pwzht84uJTGKE\nT/bPrrtthoQ7/gjJC+T8wO0pQJIrgTBDwd4MckXhCykQr9mSEAr/A2wxtNwYvmRP\ncNq13huC3uVXkMlviJi5riCNo7P2rYKn9pqJ/tO5HudDgWucxU5OhtCHLXd0vILE\nWTBK0DJQVRWkyzpThZbDaiLsmQKBgQDAhGIpJHMrh2xLJ5Suyhh0rCjXtj9U4iOl\npwYIv3Ft7UE8o2PsbJMDN+AKZi9ZIPkaDVg++D3WIC9sas+Av6vTDiF4IT3eDEUT\nj2R2bPdXyHU6HZUrGWh+hY96tFc2zn4RcFnfRMih/kPUap9dHB913z1iRWAN2EpI\n49xcoiPLFwKBgHodKxHvhfSDzzhiuwnQ6TkS0B8mc+fvuy7ZpbwjcaL8iLuQdJUK\nmQrmLHMED50wP/p9+XWGouTMSUsC4Ctyvw6tigfEQI4A/ZuJDGpdYrHKOdwLxG44\nSlNiCuEjXNpgei2p+Mj4GZuLdRIJJqNsegRl0p/Hiru+mGXgnYFfLeaJAoGADySa\noAfY80yUrRiw7krBP7QnBki0lJWxHh+ULu34GyB1aDKl8nvb2H31pnvBL66TSYRR\nM6rNGmGvuURxi/wHpPNQmKVsu2GVsWMvEM2jawk+h1K6YAiAmqsgzRMQZSQ68F45\nA4HikjNw3G2CmY1TwC7OIkO4uX4Q4cjilXq/fAMCgYAkN8h12dPLi8D1H4eHxjfS\nBsfUzf8YKdjMxX35rOsElpm+hsJcuqCT9QjSeI+mFTYMAlA0LpKTmvdgSr4hwgSR\nzb4RFE06jQsQ//dtnl4S6qcY737E4QZr2V7DNYAmH8CW+tbamVf8cqI6si2Zqeed\nhba0ALIwmvhDe1F7N5qDyQ==\n-----END PRIVATE KEY-----\n",
    "client_email": "bardr-ring-service@bardr-ring.iam.gserviceaccount.com",
    "client_id": "115238828336446764866",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/bardr-ring-service%40bardr-ring.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  });

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'bardr-app';

  private audioCtx?: AudioContext;

  private mediaRecorder!: MediaRecorder;
  private isRecording: boolean = false;
  private stream!: MediaStream;
  private audioChunks: BlobPart[] = [];

  startRecording(): void {
    if (!this.isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          this.stream = stream;
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
      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { 'type' : 'audio/ogg; codecs=opus' });
        const audioBuffer = await audioBlob.arrayBuffer();
  
        // Stream the audio to the Speech API
        const recognizeStream = speechClient.streamingRecognize({
          config: {
            encoding: 'OGG_OPUS',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
          },
          interimResults: true, // If you want interim results
        })
        .on('data', data => {
          console.log(data.results[0].alternatives[0].transcript);
          // Handle the transcript here
        })
        .on('error', error => {
          console.error(error);
        })
        .on('end', () => {
          console.log('Stream closed.');
        });
  
        // Stream the audio to the Google Cloud Speech API
        recognizeStream.write(audioBuffer);
        recognizeStream.end();
  
        // Reset for next recording
        this.audioChunks = [];
        this.isRecording = false;
      };
    }
  }  
  
}