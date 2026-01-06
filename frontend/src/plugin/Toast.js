import Swal from "sweetalert2";

function Toast(
  icon,
  title,
  text,
  position = "bottom-end",
  timer = 5000,
  onClick = null
) {
  const Toast = Swal.mixin({
    toast: true,
    position: position,
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    color: "#333", // Ensure text is dark and readable
    background: "#fff", // Ensure background is white
    didOpen: (toast) => {
      if (onClick) {
        toast.addEventListener("click", onClick);
      }
    },
  });

  return Toast.fire({
    icon: icon,
    title: title,
    text: text,
  });
}

export default Toast;
