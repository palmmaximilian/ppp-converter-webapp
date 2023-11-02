import { MantineProvider, Title, Text, Center, Divider } from "@mantine/core";

export default function Home() {
  return (
    <MantineProvider>
      <Center style={{maxWidth:600, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div>
          <Title order={2}>Welcome to 'Money in Perspective'</Title>
          <Text>
            I'm excited to share with you a couple of tools I've built for
            personal use, and now I'd like to share them with you.
          </Text>
          <Title order={3}>1. International Price Comparison (PPP Comparison):</Title>
          <Text>
            {" "}
            Ever wondered how the cost of living in one country compares to
            another? This tool uses Purchasing Power Parity (PPP) to give you a
            straightforward comparison of relative prices between two countries.
            Whether you're planning a trip or just curious about international
            prices, this tool can help you understand the real value of goods
            and services in different parts of the world.
          </Text>
          <Title order={3}>2. "Hours of Life" Converter:</Title>
          <Text>
            Sometimes, it's interesting to think about the value of a product or
            service in terms of the time it takes to earn the equivalent amount,
            rather than just money. The "Hours of Life" Converter does precisely
            that. Input your salary or hourly wage, and it'll tell you how many
            hours of your life you need to work to afford a specific item. It's
            a simple way to help you make more conscious and thoughtful spending
            decisions.
          </Text>
          <Divider />
          <Text>
            These tools aren't not revolutionary, but they've been useful to me,
            and I hope you find them helpful too. Whether you're planning a
            trip, budgeting, or just exploring a different perspective on the
            cost of living, give these tools a try.
          </Text>
        </div>
      </Center>
    </MantineProvider>
  );
}