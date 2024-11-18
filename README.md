<p align="center">
    <a href="https://ramu.osc.garden">
        <img src="https://raw.githubusercontent.com/welpo/ramu/main/app/logo_with_text.webp" width="300" alt="ramu logo: a ram with numbers on its horns">
    </a>
    <br>
    <a href="#contributing">
        <img src="https://img.shields.io/badge/prs-welcome-0?style=flat-square&labelcolor=202b2d&color=4b2e7f" alt="prs welcome"></a>
    <a href="https://ramu.osc.garden">
        <img src="https://img.shields.io/website?url=https%3a%2f%2framu.osc.garden&style=flat-square&label=app&labelcolor=202b2d&color=4b2e7f" alt="app status"></a>
    <a href="#license">
        <img src="https://img.shields.io/github/license/welpo/ramu?style=flat-square&labelcolor=202b2d&color=4b2e7f" alt="license"></a>
    <a href="https://github.com/welpo/git-sumi">
        <img src="https://img.shields.io/badge/clean_commits-git--sumi-0?style=flat-square&labelcolor=202b2d&color=4b2e7f" alt="clean commits"></a>
</p>

<p align="center">
    <a href="https://ramu.osc.garden">try it now〜</a>
</p>

<h3 align="center">master japanese numbers through random listening and reading drills</h3>

japanese numbers can be confusing. sure, it takes a few minutes to learn to count from 1 to 10, in sequence. but try backwards! or randomly! or with numbers over 100 or 1,000. or with counters! you get the idea.

i built ラム to practice listening and reading japanese numbers in different formats (42 vs 四十二), of various magnitudes (from 0 or 零 to over 100,000,000 or 一億), and with common counters (つ、本、人…).

the name reflects its purpose: achieving RAM (random access memory) to numbers, as opposed to sequential memory (1, 2, 3…). ラム means ram 🐏, thus the logo.

i wrote about the motivation for building ラム and roadblocks i encountered in [this blog post](https://osc.garden/blog/ramu-japanese-numbers-practice-web-app/).

## demo

enable sound!

https://github.com/user-attachments/assets/a404d705-55c5-485d-8396-60ece0f685b3

[try it now〜](https://ramu.osc.garden)

## features

- improve your listening and reading skills
- practice with both arabic (123…) and japanese (一二三…) numerals
- configurable number ranges
- counter word practice (個、本、匹…)
- works offline as a progressive web app
- accessible: sematic html, aria roles, keyboard controls, and screen reader friendly for arabic numbers practice
- keyboard shortcuts:
  - <kbd>space</kbd> or <kbd>→</kbd>: next/reveal
  - <kbd>esc</kbd>: stop
  - <kbd>p</kbd>: pause/resume

## requirements

ラム uses your device's text-to-speech engine to read the numbers out loud. make sure you have a japanese voice installed:

- [windows](https://support.microsoft.com/windows/appendix-a-supported-languages-and-voices-4486e345-7730-53da-fcfe-55cc64300f01#WindowsVersion=Windows_11): press `windows + ctrl + n` → narrator settings → add voices → manage voices → add voices
- [macos](https://support.apple.com/guide/mac-help/mchlp2290/mac): system settings → accessibility → spoken content → manage voices
- [ios](https://support.apple.com/111798): settings → accessibility → spoken content → voices
- android: settings → accessibility → text-to-speech
- gnu+linux: install `speech-speech-dispatcher-espeak-ng` or similar

## need help?

something not working? have an idea? let me know!

- questions or ideas → [start a discussion](https://github.com/welpo/ramu/discussions)
- found a bug? → [report it here](https://github.com/welpo/ramu/issues/new?&labels=bug&template=2_bug_report.yml)
- feature request? → [let me know](https://github.com/welpo/ramu/issues/new?&labels=feature&template=3_feature_request.yml)

## contributing

please do! i'd appreciate bug reports, improvements (however minor), suggestions…

ラム uses good ol' vanilla html, css, and javascript. to run locally:

1. clone the repository: `git clone https://github.com/welpo/ramu.git`
2. navigate to the app directory: `cd ramu/app`
3. start a local server: `python3 -m http.server`
4. visit `http://localhost:8000` in your browser

the important files are:

- `index.html`: basic structure
- `style.css`: styles
- `app.js`: main logic
- `test.js`: tests, mainly covering the number to kanji conversion. to run them visit the page with `?test` in the url. the results are printed to the console

## license

ラム is free software: you can redistribute it and/or modify it under the terms of the [GNU general public license as published by the free software foundation](./COPYING), either version 3 of the license, or (at your option) any later version.
