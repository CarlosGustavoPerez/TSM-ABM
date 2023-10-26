import { IDropdownOption } from 'office-ui-fabric-react/lib/components/Dropdown';

export interface IListItemGeneral {
    RazonSocial: string;
    NombreFantasia: string;
    Cuit:string;
    Personeria:string;
    Rubros:string;
    Estado:string;
    Email:string;
    Telefono:string;
    PaginaWeb:string;
    Pais:string;
    Provincia:string;
    Ciudad:string;
    CodigoPostal:string;
    Calle:string;
    Altura:string;
    Departamento:string;
    Piso:string;
    Observaciones:string;
    Created: string;
    CrearUsuario:string;
}
export interface IListItemComentarios {
    Comentario:string;
    Author:{EMail:string, FirstName:string,LastName:string};
    Created: string;
}

