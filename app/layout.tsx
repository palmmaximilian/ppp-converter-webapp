"use client";

import type { Metadata } from "next";
import { Link } from "react-router-dom";
import { NavLink } from "@mantine/core";
import { Inter } from "next/font/google";
// import "./globals.css";

import { Button } from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";
import { AppShell, Burger, Group, UnstyledButton } from "@mantine/core";
import { MantineLogo } from "@mantine/ds";
import classes from "./MobileNavbar.module.css";

import "@mantine/core/styles.css";

import { MantineProvider, ColorSchemeScript } from "@mantine/core";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Perspective App",
//   description: "An App to put money into perspective.",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  return (
    <html>
      <body>
        <MantineProvider>
          <AppShell
            header={{ height: 60 }}
            navbar={{
              width: 300,
              breakpoint: "sm",
              collapsed: { desktop: true, mobile: !opened },
            }}
            padding="md"
          >
            <AppShell.Header>
              <Group h="100%" px="md">
                <Burger
                  opened={opened}
                  onClick={toggle}
                  hiddenFrom="sm"
                  size="sm"
                />
                <Group justify="space-between" style={{ flex: 1 }}>

                  <MantineLogo size={30} />

                  <Group ml="xl" gap={10} visibleFrom="sm">
                    <Button
                      className={classes.control}
                      component="a"
                      variant="default"
                      href="./"
                    >
                      Home
                    </Button>
                    <Button
                      className={classes.control}
                      component="a"
                      variant="default"
                      href="./ppp_comparator"
                    >
                      PPP Comparison
                    </Button>
                    <Button
                      className={classes.control}
                      component="a"
                      variant="default"
                      href="./money-to-time"
                    >
                      Money to time
                    </Button>
                    <Button
                      className={classes.control}
                      component="a"
                      variant="default"
                      href="./about"
                    >
                      About
                    </Button>
                  </Group>
                </Group>
              </Group>
            </AppShell.Header>

            <AppShell.Navbar py="md" px={4}>
              <Button
                className={classes.control}
                component="a"
                variant="subtle"
                href="./"
              >
                Home
              </Button>
              <Button
                className={classes.control}
                component="a"
                variant="subtle"
                href="./ppp_comparator"
              >
                PPP Comparison
              </Button>
              <Button
                className={classes.control}
                component="a"
                variant="subtle"
                href="./money-to-time"
              >
                Money to time
              </Button>
              <Button
                className={classes.control}
                component="a"
                variant="subtle"
                href="./about"
              >
                About
              </Button>
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}
