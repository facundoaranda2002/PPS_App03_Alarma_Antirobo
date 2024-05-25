import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonItem, IonInput, IonList, IonToast, IonFab, IonFabButton, IonIcon, IonFabList } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonFabList, IonIcon, IonFabButton, IonFab, IonToast, IonList, IonInput, IonItem, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {

  router = inject(Router);
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  elementRef = inject(ElementRef);
  isToastOpen = false;

  constructor() {

  }

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  })

  ngOnInit() {
  }
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
  onSubmit() : void
  {
    const value = this.form.getRawValue();
    this.authService.login(value.email, value.password).subscribe({
      next:()=>{
      localStorage.setItem('password', value.password);
      this.form.setValue({email : "", password:""}), 
      this.router.navigateByUrl('/home')},
      error: ()=>{
        this.setOpen(true);
        this.form.setValue({email : "", password:""});
      }
    })
  }
  goRegister()
  {
    this.router.navigateByUrl("/registro");
  }
  goLogin()
  {
    this.router.navigateByUrl("/login");
  }
  goHome()
  { 
    this.router.navigateByUrl("/home");
  }
  logout() : void
  {
    this.authService.logout();
  }
  userA()
  {
    this.form.setValue({email : "admin@admin.com", password:"111111"}); 
  }
  userB()
  {
    this.form.setValue({email : "invitado@invitado.com", password:"222222"}); 
  }
  userC()
  {
    this.form.setValue({email : "usuario@usuario.com", password:"333333"});
  }

}
