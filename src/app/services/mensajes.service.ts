import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MensajesService {

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  private snackBar = inject(MatSnackBar);

  constructor() { }

  showMessage(mensaje: string, clase: string) {
    this.snackBar.open(mensaje, '', {
      duration: 5000, // Duración en milisegundos
      panelClass: [clase],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  informacion(mensaje: string) {
    this.showMessage(mensaje,'success-snackbar');

  }

  error(mensaje: string) {
    this.showMessage(mensaje,'error-snackbar');

  }
}
