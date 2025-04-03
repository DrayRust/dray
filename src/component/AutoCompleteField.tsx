import { Autocomplete, TextField } from '@mui/material'

interface AutoCompleteFieldProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    id?: string;
}

export const AutoCompleteField = ({label, value, options, onChange, id}: AutoCompleteFieldProps) => {
    return (
        <Autocomplete
            id={id}
            size="small"
            fullWidth
            freeSolo
            value={value}
            onChange={(_, v) => onChange(v || '')}
            options={options}
            renderInput={(params) => (
                <TextField label={label} {...params} />
            )}
        />
    )
}
