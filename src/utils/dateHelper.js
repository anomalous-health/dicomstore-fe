import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatTanggal = (date) => {
    if (!date) return '-';

    return format(
        new Date(date),
        'dd MMMM yyyy',
        { locale: id }
    );
};