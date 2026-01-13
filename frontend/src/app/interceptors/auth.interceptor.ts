import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  //get the token from the local storage
  const token = localStorage.getItem('token');

  //if token exists, clone the request and add the header
  if(token){
    const clonedReq = req.clone({
      setHeaders:{
        Authorization : `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  //if no token just passing the normal request
  return next(req);
};
