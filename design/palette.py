import sys; sys.path.insert(0,'/home/claude/ui')
exec(open('palette_core.py').read().split("N=255")[0])
B=262
P={'light':{
 'bg':(0.972,0.006,B),'surface':(0.997,0.002,B),'sunken':(0.948,0.010,B),'ink':(0.235,0.035,B),'muted':(0.47,0.03,B),'line':(0.895,0.013,B),'line-strong':(0.80,0.02,B),
 'board':(0.30,0.08,B),'board-2':(0.37,0.085,B),'on-board':(0.975,0.008,B),'on-board-muted':(0.80,0.045,B),
 'signal':(0.83,0.155,80),'signal-ink':(0.50,0.11,68),'signal-soft':(0.955,0.045,88),'on-signal':(0.235,0.035,B),
 'act':(0.42,0.15,B),'act-ink':(0.43,0.15,B),'act-soft':(0.94,0.03,B),'on-act':(0.985,0.005,B),
 'rec':(0.555,0.20,27),'rec-ink':(0.50,0.19,27),'rec-soft':(0.95,0.03,27),'on-rec':(0.99,0.005,27),
 'ok':(0.50,0.12,150),'ok-soft':(0.95,0.035,150),'warn':(0.52,0.11,65),'warn-soft':(0.955,0.04,80),
 'p1':(0.50,0.095,200),'p2':(0.54,0.15,45),'p3':(0.48,0.16,305),'on-part':(0.99,0.004,B),
 'p1-ink':(0.45,0.09,200),'p2-ink':(0.50,0.14,45),'p3-ink':(0.45,0.16,305),
 'p1-soft':(0.945,0.03,200),'p2-soft':(0.95,0.035,50),'p3-soft':(0.95,0.035,305),
},'dark':{
 'bg':(0.175,0.022,B),'surface':(0.215,0.026,B),'sunken':(0.155,0.02,B),'ink':(0.94,0.008,B),'muted':(0.77,0.022,B),'line':(0.30,0.028,B),'line-strong':(0.40,0.03,B),
 'board':(0.255,0.07,B),'board-2':(0.32,0.08,B),'on-board':(0.96,0.01,B),'on-board-muted':(0.80,0.04,B),
 'signal':(0.84,0.15,82),'signal-ink':(0.86,0.13,84),'signal-soft':(0.30,0.06,80),'on-signal':(0.20,0.03,B),
 'act':(0.76,0.11,B),'act-ink':(0.80,0.10,B),'act-soft':(0.29,0.05,B),'on-act':(0.17,0.03,B),
 'rec':(0.70,0.17,27),'rec-ink':(0.78,0.13,27),'rec-soft':(0.30,0.07,27),'on-rec':(0.16,0.03,27),
 'ok':(0.78,0.13,150),'ok-soft':(0.28,0.05,150),'warn':(0.82,0.12,80),'warn-soft':(0.30,0.05,80),
 'p1':(0.78,0.10,200),'p2':(0.78,0.13,55),'p3':(0.76,0.12,305),'on-part':(0.17,0.03,B),
 'p1-ink':(0.82,0.09,200),'p2-ink':(0.82,0.11,55),'p3-ink':(0.80,0.10,305),
 'p1-soft':(0.29,0.04,200),'p2-soft':(0.30,0.05,55),'p3-soft':(0.29,0.05,305),
}}
pairs=[('ink','bg',4.5),('ink','surface',4.5),('muted','bg',4.5),('muted','surface',4.5),('muted','sunken',4.5),('on-board','board',7),('on-board-muted','board',4.5),('signal','board',4.5),
 ('on-signal','signal',4.5),('signal-ink','surface',4.5),('signal-ink','signal-soft',4.5),('act-ink','surface',4.5),('on-act','act',4.5),('act-ink','act-soft',4.5),
 ('rec-ink','surface',4.5),('on-rec','rec',4.5),('rec-ink','rec-soft',4.5),('ok','surface',4.5),('ok','ok-soft',4.5),('warn','surface',4.5),('warn','warn-soft',4.5),
 ('on-part','p1',4.5),('on-part','p2',4.5),('on-part','p3',4.5),('p1-ink','p1-soft',4.5),('p2-ink','p2-soft',4.5),('p3-ink','p3-soft',4.5),('line-strong','surface',1.5)]
bad=0
for m,p in P.items():
    for k in p: p[k]=fit(*p[k])
    for a,b,need in pairs:
        r=wcag(p[a],p[b]); ap=apca(p[a],p[b])
        flag='' if r>=need else '  <-- LOW'
        if flag: bad+=1
        print(f"{m:5} {a:15} on {b:12} {r:5.2f}  Lc {ap:6.1f}{flag}")
import json
css=[]
for m,p in P.items():
    body=';'.join(f"--{k}:oklch({v[0]:.3f} {v[1]:.4f} {v[2]})" for k,v in p.items())
    css.append((m,body))
json.dump({m:{k:list(v) for k,v in p.items()} for m,p in P.items()},open('pal.json','w'))
open('tokens.css','w').write(
 f":root{{color-scheme:light;{css[0][1]}}}\n"
 f"@media (prefers-color-scheme:dark){{:root:not([data-theme=light]){{color-scheme:dark;{css[1][1]}}}}}\n"
 f":root[data-theme=dark]{{color-scheme:dark;{css[1][1]}}}\n")
print('bad',bad)
