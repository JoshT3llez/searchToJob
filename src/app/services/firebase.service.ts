import { Injectable,inject } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, UserCredential} from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { User } from '../models/user.model';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {getFirestore, setDoc, doc} from '@angular/fire/firestore';
import { getDoc } from 'firebase/firestore';
import { UtilsService } from './utils.service';
import 'firebase/compat/auth';
import firebase from 'firebase/compat/app';
import { AngularFireStorage } from '@angular/fire/compat/storage';




@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(
    private storage: AngularFireStorage // Agrega AngularFireStorage
  ) {}
  private userName: string;
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  setUserName(name: string): void {
    this.userName = name;
  }
  getUserName(): string {
    return this.userName;
  }
    getAuth(){
      return getAuth();
    }
  //auth
  signIn(user: User){
    return signInWithEmailAndPassword(getAuth(),user.email,user.password);
  }
//crear usuario
  signUp(user: User){
    return createUserWithEmailAndPassword(getAuth(),user.email,user.password);
  }
  updateUser(displayName: string){
    return updateProfile(getAuth().currentUser,{displayName});
  }
  signOut(){

    return getAuth().signOut();
  }
  //----------database------------
  setDocument(path:string, data:any){
    return setDoc(doc(getFirestore(),path),data);
  }
  async getDocument(path:string){
    return (await getDoc(doc(getFirestore(),path))).data();
  }


  loginwithGoogle() {
    return this.auth.signInWithPopup(new GoogleAuthProvider());
  }

  storeUserData(userCredential: firebase.auth.UserCredential) {
    const { user } = userCredential; // Obtén el usuario desde el UserCredential

    // Ahora puedes acceder a la información del usuario para almacenarla en tu base de datos
    const userData = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      // Otros datos que quieras almacenar...
    };

    const path = `Users/${user.uid}`; // Ruta donde guardar los datos

    return this.setDocument(path, userData); // Almacena los datos en Firestore
  }
  async uploadFile(filePath: string, file: File): Promise<string | null> {
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, file);

    try {
      await uploadTask;
      const downloadURL = await fileRef.getDownloadURL().toPromise();
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  async updateUserProfile(uid: string, userData: any) {
    const path = `Users/${uid}`;
    try {
      await this.setDocument(path, userData);
      return true; // o algún indicador de éxito
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false; // o manejar el error de alguna manera
    }
  }
  async getUserData(uid: string) {
    const path = `Users/${uid}`;
    try {
      const userDoc = await getDoc(doc(getFirestore(), path));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.error('No se encontraron datos para el usuario con el UID:', uid);
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return null;
    }
  }

  
  
}





