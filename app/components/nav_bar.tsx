import React from "react";
import { Tabs, rem } from "@mantine/core";
import {
  IconPhoto,
  IconMessageCircle,
  IconSettings,
} from "@tabler/icons-react";

const iconStyle = { width: (12), height: (12) };

const NavBar = () => {
  return (
 
    <menu>
        <ul>
            <a href="/" style={{marginRight: '20px'}}>Home</a>
            <a href="/ppp_comparator" style={{marginRight: '20px'}}>PPP Comparator</a>
        </ul>
    </menu>
  );
};

export default NavBar;
