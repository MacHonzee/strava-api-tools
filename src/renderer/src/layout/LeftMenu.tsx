import React from 'react'
import {
  Toolbar,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import RunCircleOutlinedIcon from '@mui/icons-material/RunCircleOutlined'
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined'
import { Link } from 'react-router-dom'

const drawerWidth = 240

function LeftMenu(): React.ReactNode {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' }
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to={'/profile'}>
              <ListItemIcon>
                <RunCircleOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary={'Profil atleta'} />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider />

        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to={'/activities'}>
              <ListItemIcon>
                <SummarizeOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary={'Aktivity'} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )
}

export default LeftMenu
