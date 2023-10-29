"use client";

import React, { useEffect, useState } from "react";
import {
  Input,
  NumberInput,
  Text,
  Divider,
  MantineProvider,
  Loader,
  Center,
  Stack,
} from "@mantine/core";

import { Combobox, InputBase, useCombobox } from "@mantine/core";
import { Fieldset } from "@mantine/core";

let countryListAPI =
  "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/purchasing-power-parity-ppp/records?select=country%2Ccountry_id%2Cyear%2Cppp";

let currenciesListAPI = "https://openexchangerates.org/api/currencies.json";

let exchangeRatesAPI =
  "https://openexchangerates.org/api/latest.json?app_id=1dc1de80829e4ebfb0c2d19ad08fce0d";

export default function PPP_comparator() {
  return PPPComparisonForm();
}

function simplifyCountryList(countryList: any) {
  console.log(countryList);
  // create an empty JSON object to store the simplified list
  let simplifiedList: any = [];
  // each country contains a country_id, country, year, and ppp
  // we only want to keep the one instance of each country with the most recent year
  countryList.forEach((country: any) => {
    let countryExists = false;
    // if the country is not in the simplified list, add it
    simplifiedList.forEach((simplifiedCountry: any) => {
      if (simplifiedCountry.country_id === country.country_id) {
        countryExists = true;
        if (simplifiedCountry.year < country.year) {
          simplifiedCountry.year = country.year;
          simplifiedCountry.ppp = country.ppp;
        }
      }
    });
    if (!countryExists && country.ppp !== null) {
      simplifiedList.push(country);
    }
  });

  return simplifiedList;
}

const PPPComparisonForm = () => {
  const [loading, setLoading] = useState(true);
  const [coutriesList, setCoutriesList] = useState([]);
  const [currenciesList, setCurrenciesList] = useState([]);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [answerText, setAnswerText] = useState(
    "Fill all the fields to see how much your purchase would cost a local!"
  );

  const [usedData, setUsedData] = useState<any>([]);

  const [purchasePrice, setPurchasePrice] = useState<string | number>("");
  const [purchaseCurrency, setPurchaseCurrency] = useState<string | null>(null);
  const [purchaseCountry, setPurchaseCountry] = useState<string | null>(null);

  const [userCountry, setUserCountry] = useState<string | null>(null);

  const userCountryComboBox = useCombobox({
    onDropdownClose: () => userCountryComboBox.resetSelectedOption(),
  });

  const purchaseCountryComboBox = useCombobox({
    onDropdownClose: () => purchaseCountryComboBox.resetSelectedOption(),
  });

  const countryOptions = coutriesList.map((country: any) => (
    <Combobox.Option key={country.country_id} value={country.country}>
      {country.country}
    </Combobox.Option>
  ));

  const userCurrencyComboBox = useCombobox({
    onDropdownClose: () => userCurrencyComboBox.resetSelectedOption(),
  });

  const puchaseCurrencyComboBox = useCombobox({
    onDropdownClose: () => puchaseCurrencyComboBox.resetSelectedOption(),
  });

  const currencyOptions = Object.entries(currenciesList).map(([key, value]) => (
    <Combobox.Option key={key} value={key}>
      {key + " - " + value}
    </Combobox.Option>
  ));

  useEffect(() => {
    const fetchData = async () => {
      // fetch the list of currencies
      const response = fetch(currenciesListAPI)
        .then((res) => res.json())
        .then((out) => {
          let temp_array: any = [];
          Object.entries(out).map(([key, value]) => {
            temp_array.push({ key: key, value: value });
          });
          setCurrenciesList(out);
        });

      // fetch exchange rates
      const exchangeRatesResponse = fetch(exchangeRatesAPI)
        .then((res) => res.json())
        .then((out) => {
          console.log(out.rates);
          setExchangeRates(out.rates);
        });

      let temp_list: any = [];
      let total_entries = 6000;
      let limit = 100;
      const fetchPromises = [];
      for (let offset = 0; offset < total_entries; offset += limit) {
        const response = fetch(
          `${countryListAPI}&offset=${offset}&limit=${limit}`
        )
          .then((res) => res.json())
          .then((out) => {
            total_entries = out.total_count;
            temp_list = temp_list.concat(out.results);
          });
        fetchPromises.push(response);
      }

      // Wait for all fetch requests to complete before setting the state
      await Promise.all(fetchPromises);

      // console.log(temp_list);
      // sort temp_list by country
      temp_list.sort((a: any, b: any) => (a.country > b.country ? 1 : -1));

      // Update the state with the combined data
      setCoutriesList(simplifyCountryList(temp_list)); // pass the array directly
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    // check if all the values are filled
    if (
      purchasePrice !== "" &&
      purchaseCurrency !== null &&
      purchaseCountry !== null &&
      userCountry !== null
    ) {
      // find the ppp for the country
      let origin_ppp = 1;
      let origin_ppp_year = 0;
      let target_ppp = 1;
      let target_ppp_year = 0;

      coutriesList.forEach((country_list: any) => {
        if (country_list.country === purchaseCountry) {
          // console.log("origin country: " + country_list);
          origin_ppp = country_list.ppp;
          origin_ppp_year = country_list.year;
        }
        if (country_list.country === userCountry) {
          // console.log("target country: " + country_list);
          target_ppp = country_list.ppp;
          target_ppp_year = country_list.year;
        }
      });

      // calculate the output value
      let outputInUSD = (Number(purchasePrice) * origin_ppp) / target_ppp;

      let output = outputInUSD;
      if (!(purchaseCurrency === "USD")) {
        output = outputInUSD * exchangeRates[purchaseCurrency];

      }

      // set the answer text
      setAnswerText(
        `Your purchase would cost the equivalent of ${output.toFixed(2)} ${purchaseCurrency} for somebody living in ${purchaseCountry}! The PPP for ${purchaseCountry} is from ${origin_ppp_year} and the PPP for ${userCountry} is from ${target_ppp_year}.`
      );

    }
    else
    {
      setAnswerText(
        "Fill all the fields to see how much your purchase would cost a local!"
      );
    }
    console.log("answer updated!");
  }, [purchasePrice, purchaseCurrency, purchaseCountry, userCountry]);

  // const calculateAnswer = () => {
  //   console.log("calculating answer"); 

  // };
  // const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   console.log(
  //     `Submitted: ${amount} ${currency} in ${country} to ${targetCurrency} in ${targetCountry}`
  //   );
  //   let amountInUSD = amount;
  //   if (!(currency === "USD")) {
  //     amountInUSD = amount / exchangeRates[currency];
  //   }

  //   // console.log(`Amount in USD: ${amountInUSD}`);

  //   // find the ppp for the country
  //   let origin_ppp = 1;
  //   let origin_ppp_year = 0;
  //   let target_ppp = 1;
  //   let target_ppp_year = 0;

  //   coutriesList.forEach((country_list: any) => {
  //     if (country_list.country_id === country) {
  //       console.log("origin country: " + country_list);
  //       origin_ppp = country_list.ppp;
  //       origin_ppp_year = country_list.year;
  //     }
  //     if (country_list.country_id === targetCountry) {
  //       console.log("target country: " + country_list);
  //       target_ppp = country_list.ppp;
  //       target_ppp_year = country_list.year;
  //     }
  //   });
  //   console.log(`Origin PPP: ${origin_ppp} Target PPP: ${target_ppp}`);

  //   // calculate the output value
  //   let outputInUSD = (amountInUSD / origin_ppp) * target_ppp;
  //   // console.log(`Output in USD: ${outputInUSD}`);

  //   let output = outputInUSD;
  //   if (!(targetCurrency === "USD")) {
  //     output = outputInUSD * exchangeRates[targetCurrency];
  //   }

  //   // console.log(`Output: ${output}`);

  //   setOutputValue(output);

  //   // output from what year the ppp values are from

  //   console.log(
  //     `Origin PPP year: ${origin_ppp_year} Target PPP year: ${target_ppp_year}`
  //   );
  // };

  return (
    // if true then show the form
    // else show "loading"
    <MantineProvider>
      {loading ? (
        <>
          <Stack>
            <Center>
              <Text>Loading data from API...</Text>
            </Center>
            <Center>
              <Loader color="blue" type="bars" />
            </Center>
          </Stack>
        </>
      ) : (
        <Fieldset legend="Get persepctive on a foreign purchase!">
          <NumberInput
            variant="filled"
            radius="lg"
            label="Purchasing Price"
            // description="How expensive is the purchase?"
            placeholder="0"
            value={purchasePrice}
            onChange={(val) => {
              setPurchasePrice(val);
              // calculateAnswer();
            }}
            min={0}
          ></NumberInput>

          <Combobox
            store={puchaseCurrencyComboBox}
            withinPortal={false}
            onOptionSubmit={(val) => {
              setPurchaseCurrency(val);
              puchaseCurrencyComboBox.closeDropdown();
              // calculateAnswer();
            }}
          >
            <Combobox.Target>
              <InputBase
                component="button"
                type="button"
                pointer
                rightSection={<Combobox.Chevron />}
                onClick={() => puchaseCurrencyComboBox.toggleDropdown()}
                rightSectionPointerEvents="none"
                label="In what currency?"
                radius="lg"
              >
                {purchaseCurrency || (
                  <Input.Placeholder>Purchase Currency</Input.Placeholder>
                )}
              </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
                {currencyOptions}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>

          <Combobox
            store={purchaseCountryComboBox}
            withinPortal={false}
            onOptionSubmit={(val) => {
              setPurchaseCountry(val);
              purchaseCountryComboBox.closeDropdown();
              // calculateAnswer();
            }}
          >
            <Combobox.Target>
              <InputBase
                component="button"
                type="button"
                pointer
                rightSection={<Combobox.Chevron />}
                onClick={() => purchaseCountryComboBox.toggleDropdown()}
                rightSectionPointerEvents="none"
                label="In what country?"
                radius="lg"
              >
                {purchaseCountry || (
                  <Input.Placeholder>Purchase Country</Input.Placeholder>
                )}
              </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
                {countryOptions}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>

          <Combobox
            store={userCountryComboBox}
            withinPortal={false}
            onOptionSubmit={(val) => {
              setUserCountry(val);
              userCountryComboBox.closeDropdown();
              // calculateAnswer();
            }}
          >
            <Combobox.Target>
              <InputBase
                component="button"
                type="button"
                pointer
                rightSection={<Combobox.Chevron />}
                onClick={() => userCountryComboBox.toggleDropdown()}
                rightSectionPointerEvents="none"
                label="Where do you work?"
                radius="lg"
              >
                {userCountry || (
                  <Input.Placeholder>Your Country</Input.Placeholder>
                )}
              </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
                {countryOptions}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
          <Divider style={{ marginTop: 10, marginBottom: 10 }} />
          <Text>{answerText}</Text>
        </Fieldset>
      )}
    </MantineProvider>
  );
};
