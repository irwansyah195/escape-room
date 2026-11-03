import Swal from 'sweetalert2';

// Konfigurasi tema default SweetAlert2 agar selaras dengan tema game
const CustomSwal = Swal.mixin({
  background: '#1e1b4b',
  color: '#f8fafc',
  confirmButtonColor: '#a855f7',
  cancelButtonColor: '#64748b',
  buttonsStyling: true,
  customClass: {
    popup: 'swal2-dark-popup',
    title: 'swal2-dark-title'
  }
});

export default CustomSwal;
export { Swal };
