

# Update 2026 New York Mets Roster for Predictions

## What's Changing

The hardcoded roster used for "Anthony's Player Parlays" (Predictions) and Talent Assessments contains several players who are no longer on the 2026 Mets, and is missing many current roster members.

## Players Being Removed (Not on 2026 Mets)

- Brandon Nimmo (was already supposed to be excluded per custom knowledge)
- Jesse Winker
- Luisangel Acuna
- Jose Iglesias
- Frankie Montas

## Players Being Added (Currently on 2026 Mets Active Roster)

- Jonah Tong (SP) -- id: 804636
- Nolan McLean (RP) -- id: 690997
- Vidal Brujan (IF) -- id: 660644
- Hayden Senger (C) -- id: 663584
- Luis Torrens (C) -- id: 620443
- Nick Morabito (OF) -- id: 703492
- Jared Young (OF/1B) -- id: 676724
- Alex Carrillo (RP) -- id: 692024
- Luis Garcia (RP) -- id: 472610
- Joey Gerber (RP) -- id: 680702
- Justin Hagenman (RP) -- id: 663795
- Bryan Hudson (RP) -- id: 663542
- Jonathan Pintaro (RP) -- id: 702752
- Dylan Ross (RP) -- id: 697811
- Austin Warren (RP) -- id: 681810

## Players Staying (Confirmed on roster)

Francisco Lindor, Juan Soto, Mark Vientos, Francisco Alvarez, Marcus Semien, Bo Bichette, Luis Robert Jr., MJ Melendez, Brett Baty, Jorge Polanco, Ronny Mauricio, Tyrone Taylor, Kodai Senga, Sean Manaea, David Peterson, Clay Holmes, Freddy Peralta, Christian Scott, Tobias Myers, Devin Williams, Luke Weaver, A.J. Minter, Dedniel Nunez, Brooks Raley, Huascar Brazoban

## Files Being Updated

1. **`supabase/functions/generate-daily-predictions/index.ts`** -- Update the `METS_2026_ROSTER` array with the correct active roster (remove 5 players, add 15 players)

2. **`supabase/functions/generate-talent-assessments/index.ts`** -- Update the fallback roster list to match the same corrected roster (remove Jose Quintana, Edwin Diaz, Jesse Winker, Jose Iglesias, Nimmo; add new players)

## Technical Details

- Both edge functions will be redeployed automatically after the update
- The predictions function excludes Brandon Nimmo per existing custom knowledge rules
- MLB player IDs are sourced directly from mlb.com/mets/roster as of today
- After deploying, a force-regenerate of predictions will pick from the updated roster

