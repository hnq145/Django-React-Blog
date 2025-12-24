import Swal from "sweetalert2";

function Toast(icon, title, text, position = "top", timer = 1500, onClick = null) {
  const Toast = Swal.mixin({
    toast: true,
    position: position,
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      if (onClick) {
        toast.addEventListener('click', onClick);
      }
    }
  });

  return Toast.fire({
    icon: icon,
    title: title,
    text: text,
  });
}

export default Toast;
