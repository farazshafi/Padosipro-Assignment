import pdfplumber

path = r'd:\projects\React Native\Mechine tasks\Padosipro\PadosiPro_FullStack_Developer_Assignment.pdf'
with pdfplumber.open(path) as pdf:
    print(f'Total Pages: {len(pdf.pages)}')
    for i, page in enumerate(pdf.pages):
        words = page.extract_words(x_tolerance=3, y_tolerance=3)
        print(f'\n=== PAGE {i+1} ({len(words)} words) ===')
        if words:
            # Group words by line based on y position
            lines = {}
            for w in words:
                y = round(w['top'] / 5) * 5  # group by approximate y
                if y not in lines:
                    lines[y] = []
                lines[y].append(w['text'])
            for y in sorted(lines.keys()):
                print(' '.join(lines[y]))
        else:
            print('[no text - image-based page]')
