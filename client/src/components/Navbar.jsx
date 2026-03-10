import {AppBar, Box, Button, Toolbar, Typography} from '@mui/material';
import {Link} from 'react-router-dom';
import React from 'react';

export default function HomeNavbar() {

    return (
        <AppBar position="static" color="transparent" elevation={1}>
            <Toolbar sx={{justifyContent: 'space-between'}}>
                <Typography variant="h6">Gioielleria Zitoli</Typography>
                <Box sx={{display: 'flex', gap: 2}}>
                    <Button component={Link} to="/">Scanner con barcode</Button>
                    <Button component={Link} to="/delete">Elimina prodotto</Button>
                    <Button component={Link} to="/get">Cerca prodotto</Button>
                    <Button component={Link} to="/create">Inserisci prodotto</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
