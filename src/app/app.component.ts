import { Component, OnInit , inject} from '@angular/core';
import { IonApp, IonRouterOutlet, IonHeader, IonButton, IonContent, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonToolbar, IonTitle, IonContent, IonButton, IonHeader, IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit{
  authService = inject(AuthService);

  router = inject(Router);

  ngOnInit(): void 
  {
    this.router.navigateByUrl("splash");
    this.authService.user$.subscribe((user)=>{
      if(user)
      {
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!
        });
      }
      else
      {
        this.authService.currentUserSig.set(null);
      }
      console.log(this.authService.currentUserSig());
    });
  }
  
}

