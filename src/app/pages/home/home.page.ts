import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonNavLink } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import { Flashlight } from '@ionic-native/flashlight/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';//ngx
import { User } from 'src/app/interfaces/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonNavLink, IonIcon, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class HomePage implements OnInit {

  presionado:boolean= false;
  clave = '';
  audioIzquierda = "../../../assets/sonidos/1.mp3";
  audioDerecha = "../../../assets/sonidos/2.mp3";
  audioVertical = "../../../assets/sonidos/3.mp3";
  audioHorizontal = "../../../assets/sonidos/4.mp3";
  audio = new Audio();
  subscription: any;
  primerIngreso: boolean = true;
  primerIngresoFlash: boolean = true;
  posicionActualCelular = 'plano';
  posicionAnteriorCelular = 'plano';
  accelerationX: any;
  accelerationY: any;
  accelerationZ: any;
  pausar:boolean = false;

  private deviceMotion = inject(DeviceMotion);
  private flashlight = inject(Flashlight);
  private vibration = inject(Vibration);
  

  constructor() { }

  ngOnInit() {
  }
  authService = inject(AuthService);
  router = inject(Router);
  
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
    this.router.navigateByUrl("/login");
  } 

  async btnActivarODesactivar(){
      
    if(this.presionado){
      let esValido = await this.mostrarIngresoContrasenia();
      if(esValido){
        this.mensaje("Alarma desactivada","success")
        setTimeout(() => {
          this.parar(); ///Paro la subscripcion al acceleration
        }, 1000);
      }else if (this.clave !== ''){
        this.mensaje("Contraseña incorrecta","error")

        this.vibration.vibrate(5000);
        this.audio.src = this.audioIzquierda;
        this.audio.play();
        this.flashlight.switchOn();
        setTimeout(() => {
          this.flashlight.switchOff();
          this.audio.src=""
        }, 5000);
      }
    }
    else{ 
      this.presionado = true;
      this.mensaje("Alarma activada","success")
      this.comenzar();
    }
  }

  mensaje(mensaje: any,icono: any){

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
    
    Toast.fire({
      icon: icono,
      title: mensaje
    })
  }

  async mostrarIngresoContrasenia() {
    let esValido = false;
    this.clave = "";
    const result = await Swal.fire({
      title: 'Ingrese su contraseña',
      input: 'password',
      heightAuto: false,
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'DESACTIVAR',
      cancelButtonText: 'CANCELAR',
      showLoaderOnConfirm: true,
      preConfirm: (clave) => {
        this.clave = clave;
        let usuarioClave = localStorage.getItem('password');
        if(usuarioClave){
            esValido = usuarioClave === clave;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });
    return esValido;
  }

  parar() {
    this.presionado = false;
    this.clave = "";
    this.audio.pause();
    this.primerIngreso = true;
    this.subscription.unsubscribe();
  }

  comenzar(){
    

    this.subscription = this.deviceMotion.watchAcceleration({ frequency: 300 }).subscribe((acceleration: DeviceMotionAccelerationData) => {
      this.accelerationX = Math.floor(acceleration.x);
      this.accelerationY = Math.floor(acceleration.y);
      this.accelerationZ = Math.floor(acceleration.z);
      this.posicionAnteriorCelular = this.posicionActualCelular;

      if(acceleration.x > 5){
        //Inclinacion Izquierda
        
        this.posicionActualCelular = 'izquierda';
        this.movimientoIzquierda();
      }
      else if (acceleration.x < -5) {
        //Inclinacion Derecha
        
        this.posicionActualCelular = 'derecha';
        this.movimientoDerecha();        
      }
      else if (acceleration.y >= 9) {
        //encender flash por 5 segundos y sonido
        this.posicionActualCelular='arriba';
        
        if ((this.posicionActualCelular!=this.posicionAnteriorCelular)) {
          this.audio.src = this.audioVertical;
          this.posicionAnteriorCelular = 'arriba';
          this.pausar = false;
        }
        
        if(!this.pausar)
          this.audio.play();

        this.movimientoVertical();
      }

      else if (acceleration.z >= 9 && (acceleration.y >= -1 && acceleration.y <= 1) && (acceleration.x >= -1 && acceleration.x <= 1)) {
        //acostado vibrar por 5 segundos y sonido
        this.posicionActualCelular='plano';
        this.movimientoHorizontal();
      }


    });
  }


  movimientoIzquierda(){
    this.primerIngreso = false;
    this.primerIngresoFlash = true;
    if(this.posicionActualCelular!=this.posicionAnteriorCelular){
      this.audio.src = this.audioIzquierda;
      this.audio.play();
    }
  }

  movimientoDerecha(){
    this.primerIngreso = false;
    this.primerIngresoFlash = true;
    if(this.posicionActualCelular!= this.posicionAnteriorCelular){
      this.audio.src = this.audioDerecha;
      this.audio.play();
    }
  }

  movimientoVertical(){
    if(this.primerIngresoFlash){
      this.primerIngresoFlash ? this.flashlight.switchOn() : null;
      setTimeout(() => {
        this.primerIngresoFlash = false;
        this.flashlight.switchOff();
        this.pausar = true;
      }, 5000);
      this.primerIngreso = false;
    }
  }

  movimientoHorizontal(){
    this.primerIngreso = false;
    this.primerIngresoFlash = true;

    if(this.posicionActualCelular!=this.posicionAnteriorCelular){
      this.audio.src = this.audioHorizontal;
      this.audio.play()
      this.vibration.vibrate(5000);
    }
  }


  cancelarDesactivar()
  {
    this.clave = "";
  }

}
