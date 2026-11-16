import math, json
# --- OKLCH -> linear sRGB -> sRGB (Ottosson's matrices) ---
def oklch_to_srgb(L, C, h):
    a, b = C*math.cos(math.radians(h)), C*math.sin(math.radians(h))
    l_ = L + 0.3963377774*a + 0.2158037573*b
    m_ = L - 0.1055613458*a - 0.0638541728*b
    s_ = L - 0.0894841775*a - 1.2914855480*b
    l, m, s = l_**3, m_**3, s_**3
    r = +4.0767416621*l - 3.3077115913*m + 0.2309699292*s
    g = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s
    bb= -0.0041960863*l - 0.7034186147*m + 1.7076147010*s
    return (r, g, bb)
def in_gamut(rgb): return all(-0.0005 <= c <= 1.0005 for c in rgb)
def fit(L,C,h):
    # CSS Color 4 style: keep L and h, lower chroma until the colour fits in sRGB
    if in_gamut(oklch_to_srgb(L,C,h)): return (L,C,h)
    lo,hi=0.0,C
    for _ in range(30):
        mid=(lo+hi)/2
        if in_gamut(oklch_to_srgb(L,mid,h)): lo=mid
        else: hi=mid
    return (L,math.floor(lo*1e4)/1e4,h)
def gamma(c): c=min(1,max(0,c)); return 12.92*c if c <= 0.0031308 else 1.055*c**(1/2.4)-0.055
def hexof(L,C,h):
    lin=oklch_to_srgb(L,C,h); return '#'+''.join('%02x'%round(gamma(c)*255) for c in lin), in_gamut(lin)
def relY(L,C,h):
    r,g,b=[min(1,max(0,c)) for c in oklch_to_srgb(L,C,h)]
    return 0.2126*r+0.7152*g+0.0722*b
def wcag(t,bg):
    a,b=relY(*t),relY(*bg); hi,lo=max(a,b),min(a,b); return (hi+0.05)/(lo+0.05)
def apca(t,bg):  # APCA-W3 0.0.98G-4g simplified
    def Ys(c):
        r,g,b=[gamma(min(1,max(0,x))) for x in oklch_to_srgb(*c)]
        return 0.2126729*r**2.4+0.7151522*g**2.4+0.0721750*b**2.4
    def clamp(y): return y if y>0.022 else y+(0.022-y)**1.414
    Yt,Yb=clamp(Ys(t)),clamp(Ys(bg))
    if Yb>Yt: S=(Yb**0.56-Yt**0.57)*1.14; out = 0 if S<0.1 else S-0.027
    else: S=(Yb**0.65-Yt**0.62)*1.14; out = 0 if S>-0.1 else S+0.027
    return round(out*100,1)
N=255  # neutral hue (cool slate, leans toward the accent)
P = {
 'light': {
  'bg':(0.972,0.006,N),'surface':(0.995,0.003,N),'sunken':(0.945,0.010,N),'ink':(0.235,0.025,N),'muted':(0.48,0.022,N),'line':(0.895,0.012,N),
  'accent':(0.50,0.19,268),'accent-soft':(0.935,0.035,268),'accent-ink':(0.42,0.17,268),'on-accent':(0.99,0.005,268),
  'rec':(0.56,0.19,25),'rec-soft':(0.945,0.03,25),'ok':(0.53,0.12,150),'ok-soft':(0.945,0.035,150),'warn':(0.56,0.12,70),'warn-soft':(0.95,0.04,80),
  'p1':(0.45,0.13,255),'p1-soft':(0.93,0.04,255),'p2':(0.45,0.13,60),'p2-soft':(0.93,0.04,60),'p3':(0.45,0.13,320),'p3-soft':(0.93,0.04,320),
 },
 'dark': {
  'bg':(0.175,0.014,N),'surface':(0.215,0.016,N),'sunken':(0.155,0.012,N),'ink':(0.935,0.008,N),'muted':(0.74,0.018,N),'line':(0.30,0.018,N),
  'accent':(0.74,0.14,268),'accent-soft':(0.29,0.06,268),'accent-ink':(0.80,0.11,268),'on-accent':(0.18,0.03,268),
  'rec':(0.70,0.17,25),'rec-soft':(0.28,0.06,25),'ok':(0.74,0.13,150),'ok-soft':(0.27,0.05,150),'warn':(0.80,0.12,75),'warn-soft':(0.29,0.05,75),
  'p1':(0.80,0.10,255),'p1-soft':(0.30,0.05,255),'p2':(0.80,0.10,60),'p2-soft':(0.30,0.05,60),'p3':(0.80,0.10,320),'p3-soft':(0.30,0.05,320),
 }}
pairs=[('ink','bg'),('ink','surface'),('muted','bg'),('muted','surface'),('accent-ink','surface'),('on-accent','accent'),('accent-ink','accent-soft'),
       ('rec','surface'),('ok','surface'),('warn','surface'),('ok','ok-soft'),('rec','rec-soft'),('warn','warn-soft'),('p1','p1-soft'),('p2','p2-soft'),('p3','p3-soft'),('line','surface')]
out={}
P['dark']['muted']=(0.79,0.016,N); P['dark']['rec']=(0.75,0.15,25); P['dark']['rec-soft']=(0.30,0.06,25)
for mode,pal in P.items():
    for k in pal: pal[k]=fit(*pal[k])
for mode,pal in P.items():
    print(f'== {mode}')
    for k,v in pal.items():
        hx,ok=hexof(*v)
        if not ok: print('  OUT OF GAMUT', k, v)
        out.setdefault(mode,{})[k]=(v,hx)
    for t,b in pairs:
        print(f'  {t:11s} on {b:12s} WCAG {wcag(pal[t],pal[b]):5.2f}  APCA Lc {apca(pal[t],pal[b]):6.1f}')
# band ramp 4..9 in OKLCH: hue 25 (red) -> 145 (green), constant L/C so each step looks equally strong
ramp={}
for i,band in enumerate([4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9]):
    h=25+ (145-25)*i/10
    ramp[band]={'light':{'bg':fit(0.92,0.06,h),'fg':fit(0.42,0.11,h)},'dark':{'bg':fit(0.31,0.06,h),'fg':fit(0.86,0.10,h)}}
    for m in ('light','dark'):
        r=ramp[band][m]
        assert hexof(*r['bg'])[1] and hexof(*r['fg'])[1], (band,m)
    print('band',band,'h=%.0f'%h,'light WCAG %.2f'%wcag(ramp[band]['light']['fg'],ramp[band]['light']['bg']),'dark WCAG %.2f'%wcag(ramp[band]['dark']['fg'],ramp[band]['dark']['bg']))
json.dump({m:{k:{'oklch':v[0],'hex':v[1]} for k,v in d.items()} for m,d in out.items()}, open('/home/claude/ui/palette.json','w'))
json.dump({str(k):v for k,v in ramp.items()}, open('/home/claude/ui/ramp.json','w'))
# compare: HSL at same "lightness" 50% for red/green/blue gives very different perceived lightness
import colorsys
for name,hh in [('red',0),('green',120/360),('blue',240/360),('yellow',60/360)]:
    r,g,b=colorsys.hls_to_rgb(hh,0.5,1.0)
    lin=[(c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4) for c in (r,g,b)]
    l=0.4122214708*lin[0]+0.5363325363*lin[1]+0.0514459929*lin[2]; m=0.2119034982*lin[0]+0.6806995451*lin[1]+0.1073969566*lin[2]; s=0.0883024619*lin[0]+0.2817188376*lin[1]+0.6299787005*lin[2]
    L=0.2104542553*l**(1/3)+0.7936177850*m**(1/3)-0.0040720468*s**(1/3)
    print(f'HSL({name},100%,50%) -> OKLab L = {L:.2f}')
