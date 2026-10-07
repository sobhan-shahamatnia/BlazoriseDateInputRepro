# Blazorise `DateInput`: typing a leading zero resets the date

Minimal reproduction for a keyboard-entry defect in Blazorise `DateInput` (Blazorise **2.3.3**, also 2.3.2; the
relevant code on `master` is unchanged). Related, closed as *Not Planned / External Resolution*:
[#3729](https://github.com/Megabit/Blazorise/issues/3729), [#4309](https://github.com/Megabit/Blazorise/issues/4309),
[#1029](https://github.com/Megabit/Blazorise/issues/1029).

## Run

Requires the .NET 10 SDK. Blazor Web App, Interactive Server.

- **Visual Studio:** open `BlazoriseDateInputRepro.slnx`, then press F5.
- **CLI:** run `dotnet run` and open the printed URL (`http://localhost:5136`) in Chrome or Edge.

## Steps

Every field on the page starts at 15 March 2030. Click the first segment of a field and type the digits
without separators. Reload the page before each attempt.

| Browser locale | Type | Expected | Row 1 `DateInput<DateOnly>` | Row 2 `DateInput<DateOnly?>` | Row 3 plain `<input type="date">` |
| --- | --- | --- | --- | --- | --- |
| dd.MM.yyyy (de-DE) | `02052030` | 2030-05-02 | **2030-05-20** | **2030-05-20** | 2030-05-02 |
| MM/dd/yyyy (en-US) | `01052030` | 2030-01-05 | **2030-10-05** | **2030-10-05** | 2030-01-05 |

Measured with Edge (Chromium). In row 1 every incomplete segment resets the date to `0001-01-01`, so segments
that were already typed jump back to `01` (e.g. en-US `02052030` gives 2030-01-05 instead of 2030-02-05). Row 2
writes `null` once, which drops the typed leading `0`; the next digit then starts the segment over (`1`, `0`
becomes month `10`; `2`, `0` becomes day `20`).

The log at the bottom of the page records every programmatic write to an `<input type="date">` value. While
typing, rows 1 and 2 cause writes and row 3 causes none.

## Cause

The browser is not the cause: row 3 shows that the same keystrokes work in a plain date input. While a segment
is incomplete (after typing the `0` of `02`) the browser reports `value=""` and fires `change`. Then:

1. `BaseInputComponent.CurrentValueHandler` replaces the empty string with `DefaultValue` (`0001-01-01` for
   `DateOnly`, `null` for `DateOnly?`) and the component re-renders.
2. `DateInput.razor` renders `value="@CurrentValueAsString"` with a plain `@onchange` handler. Unlike `@bind`,
   this does not emit `SetUpdatesAttributeName("value")`, so Blazor does not update the render tree with the
   value the browser sent. The render-tree diff therefore writes `element.value` back into the input.
3. Assigning `element.value` resets the browser's in-progress segment input. The typed `0` is lost, and
   `2`, `0` becomes day `20`.

On Blazor Server with network latency it gets worse: because every change is written back, a late server
render can overwrite keystrokes the user typed in the meantime.
