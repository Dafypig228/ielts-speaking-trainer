# Colour and layout notes

Colours are defined in OKLCH (Björn Ottosson's OKLab in polar form). `palette.py` generates every token,
fits it into the sRGB gamut by lowering chroma only (lightness and hue stay fixed), and checks each
text/background pair with WCAG 2 contrast and APCA. `tokens.css` is the output (hex fallbacks first,
oklch() where supported).

- Neutrals lean slightly toward the accent hue (255–268) so greys and blue read as one family.
- Part 1 / 2 / 3 colours share the same L and C and differ only in hue, so none looks more important.
- Band chips 4.0→9.0 walk hue 25→145 at constant L and C; contrast stays ~6.5–7:1 on every step.
- Dark mode was tuned against APCA (WCAG 2 overstates contrast for dark pairs).
- Colour never carries meaning alone: parts have labels, bands show numbers, recording shows text + time.

Layout: one column, 44px minimum targets, the record / next controls in a bottom dock in the thumb zone,
5 bottom tabs, filters collapsed behind a one-line summary, Undo instead of confirmation for deleting takes.
