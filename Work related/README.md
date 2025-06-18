Okay, I understand you'd like the content of the selected text from the Canvas in a non-Canvas format. Here it is:

# .NET Datetime to Ticks Converter

This simple web-based utility helps developers and users convert ISO-formatted UTC datetimes into `.NET Ticks` and simultaneously generates an `NCalc` expression for filtering by date ranges in backend services.

## What are .NET Ticks?

In the .NET framework, a `DateTime` value is represented internally as the number of 100-nanosecond intervals that have elapsed since 12:00:00 midnight, January 1, 0001 A.D. (0001-01-01 00:00:00.000, UTC), excluding leap seconds. This is significantly different from Unix time, which counts seconds since January 1, 1970.

This tool is particularly useful when working with systems that rely on .NET Ticks for timestamp storage and filtering, allowing for precise date comparisons.

## Features

  * **ISO to Ticks Conversion:** Converts input ISO 8601 formatted UTC datetime strings (e.g., `YYYY-MM-DDTHH:MM:SS`) into their corresponding .NET Ticks values.

  * **NCalc Expression Generation:** Automatically creates an `NCalc` compatible expression for filtering data based on the provided start and end datetimes.

  * **Intuitive Interface:** A straightforward web interface for quick conversions.

## How to Use

1.  **Navigate to the Tool:** Open the [Datetime to Ticks Converter](https://www.google.com/search?q=https://lequang1024.github.io/datetime-to-ticks.html) page in your browser.

2.  **Enter Start Datetime (UTC):** In the "Start datetime (UTC)" field, enter your desired start date and time in `YYYY-MM-DDTHH:MM:SS` format.

3.  **Enter End Datetime (UTC):** In the "End datetime (UTC)" field, enter your desired end date and time in `YYYY-MM-DDTHH:MM:SS` format.

4.  **View Results:** As you type, the "NCalc Expression" textarea will automatically update with the generated expression, ready for copy-pasting.

**Example Input:**

  * Start datetime: `2023-01-01T00:00:00`

  * End datetime: `2023-01-02T00:00:00`

**Example Output (NCalc Expression):**
`DateNow.Ticks >= 638082240000000000 AND DateNow.Ticks < 638083104000000000`

## Technical Details

The conversion relies on the `TICKS_AT_EPOCH` constant, which is `621355968000000000`. This value represents the number of .NET Ticks that have elapsed between Jan 1, 0001 (UTC) and Jan 1, 1970 (UTC), the Unix epoch. The JavaScript `Date.getTime()` method returns milliseconds since Unix epoch, so multiplying by 10,000 converts it to 100-nanosecond intervals, and then adding `TICKS_AT_EPOCH` shifts it to the .NET Ticks reference point.

## NCalc Expressions

NCalc is a simple expression evaluator for .NET. The generated expression allows you to easily filter data where a `DateNow.Ticks` property falls within the specified date range. The expression uses `>=` for the start date (inclusive) and `<` for the end date (exclusive) to cover the entire day.

[Back to Tools Index](https://www.google.com/search?q=https://lequang1024.github.io/)