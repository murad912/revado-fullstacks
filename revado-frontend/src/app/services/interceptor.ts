import { HttpInterceptorFn } from '@angular/common/http';

// Verify the 'export' keyword is here!
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('revaDoToken');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  return next(req);
};