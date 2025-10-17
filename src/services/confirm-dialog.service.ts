import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  async confirm(options: {
    title: string;
    html?: string;
    text?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: SweetAlertIcon;
  }): Promise<boolean> {
    const result = await Swal.fire({
      title: options.title,
      html: options.html,
      text: options.text,
      icon: options.icon ?? 'question',
      showCancelButton: true,
      confirmButtonText: options.confirmText ?? 'Aceptar',
      cancelButtonText: options.cancelText ?? 'Cancelar',
      confirmButtonColor: '#3b82f6', // azul Tailwind
      cancelButtonColor: '#ef4444',  // rojo Tailwind
      reverseButtons: true,
      focusCancel: true,
    });

    return result.isConfirmed;
  }

  async success(title: string, text?: string) {
    await Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3b82f6',
    });
  }

  async error(title: string, text?: string) {
    await Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3b82f6',
    });
  }
}
