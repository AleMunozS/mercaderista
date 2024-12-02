export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  roles: string;
}

export interface UsuarioFormInputValues {
  nombre: string;
  email: string;
  password?: string;
  roles: string;
}

export interface Local {
  id: number;
  nombre: string;
  direccion: string;
  supermercado: string;
}

export interface LocalFormInputValues {
  nombre: string;
  direccion: string;
  supermercado: string;
}


export interface Asistencia {
  id: number;
  usuarioId: number;
  localId: number;
  usuario: Usuario;
  local: Local;
  checkInTime: string;
  checkInGeoLocation: string;
  checkOutTime?: string;
  checkOutGeoLocation?: string;
}

export interface AsistenciaFormInputValues {
  usuarioId: number;
  localId: number;
  checkInTime: any; // dayjs object
  checkInGeoLocation: string;
  checkOutTime?: any; // dayjs object
  checkOutGeoLocation?: string;
}

export interface Item {
  id: number;
  voucherId: number;
  nombre: string;
  cantidad: number;
  precio?: number;
  itemCode: string
}

export interface Foto {
  id: number;
  voucherId: number;
  url: string;
}
export interface VoucherLine {
  id: number;
  voucherId: number;
  itemId: number;
  cantidad: number;
  precio?: number;
  item: Item;
}

export interface Voucher {
  id: number;
  tipo: string;
  usuarioId: number;
  localId: number;
  usuario: Usuario;
  local: Local;
  createdAt: string;
  voucherLines: VoucherLine[];
  fotos: Foto[];
}

export interface VoucherLineInput {
  itemId: number;
  cantidad: number;
  precio?: number;
}

export interface VoucherFormInputValues {
  tipo: string;
  usuarioId: number;
  localId: number;
  voucherLines: VoucherLineInput[];
  fotos: Foto[];
  // Campos adicionales para agregar voucherLines y fotos
  itemId?: number;
  itemCantidad?: number;
  itemPrecio?: number;
}

export interface Evento {
  id: number;
  usuarioId: number;
  usuario: Usuario;
  mensaje: string;
  createdAt: string;
}

export interface EventoFormInputValues {
  usuarioId: number;
  mensaje: string;
}

export interface SummaryData {
  totalUsuarios: number;
  totalLocales: number;
  totalVouchers: number;
  totalEventos: number;
}

export interface EventoWithUsuarioNombre extends Evento {
  usuarioNombre: string;
}