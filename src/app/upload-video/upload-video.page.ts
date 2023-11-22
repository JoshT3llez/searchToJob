import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-upload-video',
  templateUrl: './upload-video.page.html',
  styleUrls: ['./upload-video.page.scss'],
})
export class UploadVideoPage {
  title: string;
  hashtag: string;
  description: string;
  selectedFile: File;
  uploadPercent: number;
  videoURL: string;
  

  constructor(
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  openFileInput() {
    document.getElementById('fileInput').click();
  }

  onFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.readVideoURL();
    }
  }

  async readVideoURL() {
    const fileReader = new FileReader();

    fileReader.onload = (e: any) => {
      this.videoURL = e.target.result;
    };

    fileReader.readAsDataURL(this.selectedFile);
  }

  async subirVideo(videoForm) {
    if (videoForm.valid) {
      const user = await this.auth.currentUser;

      if (user && this.selectedFile) {
        const filePath = `videos/${user.uid}_${new Date().getTime()}_${this.selectedFile.name}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, this.selectedFile);

        task.snapshotChanges().pipe(
          finalize(async () => {
            try {
              const downloadURL = await fileRef.getDownloadURL().toPromise();

              await this.firestore.collection('videos').add({
                title: this.title,
                hashtag: this.hashtag,
                description: this.description,
                videoURL: downloadURL,
                username: user.displayName,
                userId: user.uid,
                timestamp: new Date(),
              });

            } catch (error) {
              console.error('Error al obtener el URL de descarga:', error);
            }
          })
        ).subscribe((snapshot) => {
          this.uploadPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        });
      }
    }
  }
}

