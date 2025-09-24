// This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © Lupown
//@version=5
///////////////////////////////////////////////////////////////////////////////////////////////////
//// STUDY
///////////////////////////////////////////////////////////////////////////////////////////////////
indicator(title='Multiple indicators + TL Alerts [LUPOWN]', shorttitle='Multiple Indicators [LPWN]', max_bars_back=5000, max_lines_count=500,  overlay=true,  linktoseries=true,max_labels_count=500, max_boxes_count = 500)


// EMAS
show_Emas = input(true, title='--------- Show EMAS ---------')


MA1 = input.int(10, minval=1, title='MA1', inline='ma1')
string type1 = input.string('EMA', title='Type MA1', options=['SMA', 'EMA', 'WMA', 'LSMA', 'ALMA', 'HMA', 'KAMA', 'RMA', 'DEMA', 'TEMA', 'VWMA', 'SWMA', 'Wild'], inline='ma1')
MA2 = input.int(55, minval=1, title='MA2', inline='ma2')
string type2 = input.string('EMA', title='Type MA2', options=['SMA', 'EMA', 'WMA', 'LSMA', 'ALMA', 'HMA', 'KAMA', 'RMA', 'DEMA', 'TEMA', 'VWMA', 'SWMA', 'Wild'], inline='ma2')
MA3 = input.int(100, minval=1, title='MA3', inline='ma3')
string type3 = input.string('EMA', title='Type MA3', options=['SMA', 'EMA', 'WMA', 'LSMA', 'ALMA', 'HMA', 'KAMA', 'RMA', 'DEMA', 'TEMA', 'VWMA', 'SWMA', 'Wild'], inline='ma3')
MA4 = input.int(200, minval=1, title='MA4', inline='ma4')
string type4 = input.string('EMA', title='Type MA4', options=['SMA', 'EMA', 'WMA', 'LSMA', 'ALMA', 'HMA', 'KAMA', 'RMA', 'DEMA', 'TEMA', 'VWMA', 'SWMA', 'Wild'], inline='ma4')


// Kaufman's Adaptive Moving Average - Fast and Slow Ends
fastK = 0.666  // KAMA Fast End
slowK = 0.645  // KAMA Slow End
kama(x, t) =>
    dist = math.abs(x[0] - x[1])
    signal = math.abs(x - x[t])
    noise = math.sum(dist, t)
    effr = noise != 0 ? signal / noise : 1
    sc = math.pow(effr * (fastK - slowK) + slowK, 2)
    kama = x
    kama := nz(kama[1]) + sc * (x - nz(kama[1]))
    kama

ma(MAType, MASource, MAPeriod) =>
    if MAPeriod > 0
        if MAType == 'SMA'
            ta.sma(MASource, MAPeriod)
        else if MAType == 'LSMA'
            ta.linreg(MASource, MAPeriod, 0)
        else if MAType == 'EMA'
            ta.ema(MASource, MAPeriod)
        else if MAType == 'WMA'
            ta.wma(MASource, MAPeriod)
        else if MAType == 'RMA'
            ta.rma(MASource, MAPeriod)
        else if MAType == 'HMA'
            ta.hma(MASource, MAPeriod)
        else if MAType == 'DEMA'
            e = ta.ema(MASource, MAPeriod)
            2 * e - ta.ema(e, MAPeriod)
        else if MAType == 'TEMA'
            e = ta.ema(MASource, MAPeriod)
            3 * (e - ta.ema(e, MAPeriod)) + ta.ema(ta.ema(e, MAPeriod), MAPeriod)
        else if MAType == 'VWMA'
            ta.vwma(MASource, MAPeriod)
        else if MAType == 'ALMA'
            ta.alma(MASource, MAPeriod, 6, .85)
        else if MAType == 'SWMA'
            ta.swma(MASource)
        else if MAType == 'KAMA'
            kama(MASource, MAPeriod)
        else if MAType == 'Wild'
            wild = MASource
            wild := nz(wild[1]) + (MASource - nz(wild[1])) / MAPeriod
            wild

emc12 = input(false, title='----EMA cross 1-2---')
emc13 = input(false, title='----EMA cross 1-3---')
emc23 = input(false, title='----EMA cross 2-3---')
emc24 = input(false, title='----EMA cross 2-4---')


st = input(false, title='ShowTrend')
upTrend = ma(type3, close, MA3) >= ma(type4, close, MA4)
downTrend = ma(type3, close, MA3) < ma(type4, close, MA4)
t1 = ma(type1, close, MA1)
t2 = ma(type2, close, MA2)
t3 = ma(type3, close, MA3)
t4 = ma(type4, close, MA4)
t11 = plot(show_Emas ? t1 : na, color=color.new(#3b78eb, 0), linewidth=1, title='MA1')
t22 = plot(show_Emas ? t2 : na, color=color.new(#B45F04, 0), linewidth=2, title='MA2')
t33 = plot(show_Emas ? t3 : na, color=st and upTrend ? color.lime : st and downTrend ? color.red : #b83d27, linewidth=1, title='MA3')
t44 = plot(show_Emas ? t4 : na, color=st and upTrend ? color.lime : st and downTrend ? color.red : #b83d27, linewidth=3, title='MA4')



bgcolor(color=ta.cross(t1, t2) and emc12 ? color.red : na, title='cross 1-2', transp=90)
bgcolor(color=ta.cross(t2, t3) and emc13 ? color.green : na, title='cross 1-3', transp=90)
bgcolor(color=ta.cross(t2, t3) and emc23 ? color.purple : na, title='cross 2-3', transp=90)
bgcolor(color=ta.cross(t2, t4) and emc24 ? color.yellow : na, title='cross 2-4', transp=90)

fill(t11, t22, color=st ? color.gray : na, title='trend fill', transp=75)
plotshape(st and upTrend ? upTrend : na, title='Conservative Buy Entry Triangle', style=shape.triangleup, location=location.bottom, color=color.new(color.lime, 0), offset=0)
plotshape(st and downTrend ? downTrend : na, title='Conservative Short Entry Triangle', style=shape.triangledown, location=location.top, color=color.new(color.red, 0), offset=0)



ShowBuySellArrows = input(true, title='-----------Show Buy/Sell TL--------')
ShowBuySellArrowsK = input(false, title='-----------Show Buy/Sell Koncorde--------')
lpwn = input(false, title='-----------Lupown señal----------')
show_whalec = input(false, title='----------- Show whale  -----------')
show_adminc = input(false, title='-------- Show whale invert --------')
show_nada = input(false, title='-------- Show nadaraya signals --------')







///////////////////////////
////////////
////////////////////////
showhbs = input(false, title='------ Show heikin BuySell -----')
EMAlength = input(55, 'EMA LENGTH?')

srch = ohlc4
haOpen = 0.0
haOpen := (srch + nz(haOpen[1])) / 2
haC = (ohlc4 + nz(haOpen) + math.max(high, nz(haOpen)) + math.min(low, nz(haOpen))) / 4
EMA1 = ta.ema(haC, EMAlength)
EMA2 = ta.ema(EMA1, EMAlength)
EMA3 = ta.ema(EMA2, EMAlength)
TMA1 = 3 * EMA1 - 3 * EMA2 + EMA3
EMA4 = ta.ema(TMA1, EMAlength)
EMA5 = ta.ema(EMA4, EMAlength)
EMA6 = ta.ema(EMA5, EMAlength)
TMA2 = 3 * EMA4 - 3 * EMA5 + EMA6
IPEK = TMA1 - TMA2
YASIN = TMA1 + IPEK
EMA7 = ta.ema(hlc3, EMAlength)
EMA8 = ta.ema(EMA7, EMAlength)
EMA9 = ta.ema(EMA8, EMAlength)
TMA3 = 3 * EMA7 - 3 * EMA8 + EMA9
EMA10 = ta.ema(TMA3, EMAlength)
EMA11 = ta.ema(EMA10, EMAlength)
EMA12 = ta.ema(EMA11, EMAlength)
TMA4 = 3 * EMA10 - 3 * EMA11 + EMA12
IPEK1 = TMA3 - TMA4
YASIN1 = TMA3 + IPEK1

mavi = YASIN1
kirmizi = YASIN


longCond = mavi > kirmizi and mavi[1] <= kirmizi[1]
shortCond = mavi < kirmizi and mavi[1] >= kirmizi[1]






last_signal = 0
long_final = longCond and (nz(last_signal[1]) == 0 or nz(last_signal[1]) == -1)
short_final = shortCond and (nz(last_signal[1]) == 0 or nz(last_signal[1]) == 1)


last_signal := long_final ? 1 : short_final ? -1 : last_signal[1]

plotshape(long_final and showhbs, style=shape.triangleup, location=location.belowbar, color=color.new(color.blue, 0), size=size.tiny, title='buy label', text='BUY', textcolor=color.new(color.white, 0))
plotshape(short_final and showhbs, style=shape.triangledown, location=location.abovebar, color=color.new(color.red, 0), size=size.tiny, title='sell label', text='SELL', textcolor=color.new(color.white, 0))



//////////////////////////////////////////////////////
/////////VWAP
/////////////////////////////////////////////////////

displayVW = input(false, title='------Show VWAP--------')
vwp = displayVW ? ta.vwap : na
plot(vwp, color=color.new(#ffff1f, 0), title='VWAP', linewidth=2)


//////////////
///// END VWAP
////////////


//////////////////////////////////////////////////////
/////////PARABOLIC SAR
/////////////////////////////////////////////////////
show_ps = input(false, title='----------Show Parabolic SAR---------')
start = input(0.02)
increment = input(0.02)
maximum = input(0.2, 'Max Value')
out = ta.sar(start, increment, maximum)
plot(show_ps ? out : na, 'ParabolicSAR', style=plot.style_cross, color=color.new(#2962FF, 0))


//////////////
///// END PARABOLIC SAR
////////////

//////////////////
// KONCORDE
///////////////////



srcTprice = input(ohlc4, title='Fuente para Precio Total')
srcMfi = input.source(hlc3, title='Fuente MFI', group='Money Flow Index')
tprice = srcTprice

//lengthEMA = input(255, minval=1)

scaleK = input(8, title='Koncorde scale')
m = input(15, title='Media Exponencial')
longitudPVI = input(90, title='Longitud PVI')
longitudNVI = input(90, title='Longitud NVI')
longitudMFI = input(14, title='Longitud MFI')
multK = input.float(2.0, title='Multiplicador para derivacion estandar', group='Bollinger Oscillator')
boLength = input.int(25, title='Calculation length ', group='Bollinger Oscillator')
mult = input.float(2.0, title='Multiplicador para derivacion estandar', group='Bollinger Oscillator')
pvim = ta.ema(ta.pvi, m)
pvimax = ta.highest(pvim, longitudPVI)
pvimin = ta.lowest(pvim, longitudPVI)
oscp = (ta.pvi - pvim) * 100 / (pvimax - pvimin)

nvim = ta.ema(ta.nvi, m)
nvimax = ta.highest(nvim, longitudNVI)
nvimin = ta.lowest(nvim, longitudNVI)
azul = (ta.nvi - nvim) * 100 / (nvimax - nvimin)

xmf = ta.mfi(srcMfi, longitudMFI)

// Bands Calculation
basisK = ta.sma(tprice, boLength)  //Find the 20-day moving average average (n1 + n2 ... + n20)/20
devK = mult * ta.stdev(tprice, boLength)  //Find the standard deviation of the 20-days
upperK = basisK + devK  //Upper Band = 20-day Moving Average + (2 x standard deviation of the 20-days)
lowerK = basisK - devK  //Lower Band = 20-day Moving Average - (2 x standard deviation of the 20-days)
OB1 = (upperK + lowerK) / 2.0
OB2 = upperK - lowerK

BollOsc = (tprice - OB1) / OB2 * 100  // percent b
xrsi = ta.rsi(tprice, 14)

calc_stoch(src, length, smoothFastD) =>
    ll = ta.lowest(low, length)
    hh = ta.highest(high, length)
    k = 100 * (src - ll) / (hh - ll)
    ta.sma(k, smoothFastD)

stoc = calc_stoch(tprice, 21, 3)
marron = (xrsi + xmf + BollOsc + stoc / 3) / 2
verde = marron + oscp
media = ta.ema(marron, m)
bandacero = 0
//scaleK1 = (ni/scale)/scaleK

buy_cK = ta.crossover(marron, media)
sell_cK = ta.crossunder(marron, media)
plotshape(ShowBuySellArrowsK and buy_cK, 'Buy', shape.triangleup, location.belowbar, color.new(color.green, 0), text='Buy', textcolor=color.new(color.green, 0))
plotshape(ShowBuySellArrowsK and sell_cK, 'Sell', shape.triangledown, location.abovebar, color.new(color.red, 0), text='Sell', textcolor=color.new(color.red, 0))




//////////////////
// KONCORDE
///////////////////


//////////////////////////
////BOLLINGER BANDS
////////////////////
show_BB = input(false, title='--------- Show Bollinger ---------')
lengthB = input.int(20, minval=1)
srcB = input(close, title='Source')
//mult = input(2.0, minval=0.001, maxval=50, title="StdDev")
basis = ta.sma(srcB, lengthB)
dev = mult * ta.stdev(srcB, lengthB)
upper = basis + dev
lower = basis - dev
offsetB = input.int(0, 'Offset', minval=-500, maxval=500)
plot(show_BB ? basis : na, 'Basis', color=color.new(#919191, 0), offset=offsetB)
p1 = plot(show_BB ? upper : na, 'Upper', color=color.new(#ff0059, 0), offset=offsetB)
p2 = plot(show_BB ? lower : na, 'Lower', color=color.new(#ff0059, 0), offset=offsetB)
fill(p1, p2, title='Background', color=color.rgb(255, 205, 222, 95))



//////
///
///////



/////////////
////ATR 
//////////////

show_ATR = input(false, title='--------------Show ATR------------')
source_ATR = input(close, title='Source ATR')
length_ATR = input.int(14, minval=1, title='Period')
multiplier = input.float(1.6, minval=0.1, step=0.1, title='Multiplier')
shortStopLoss = source_ATR + ta.atr(length_ATR) * multiplier
longStopLoss = source_ATR - ta.atr(length_ATR) * multiplier
plot(show_ATR ? shortStopLoss : na, color=color.new(color.gray, 0), linewidth=1, style=plot.style_stepline, title='Short Stop Loss')
plot(show_ATR ? longStopLoss : na, color=color.new(color.gray, 0), linewidth=1, style=plot.style_stepline, title='Long Stop Loss')





///////////
//////END ATR
//////////////////


//////////////////
////  ICHIMOKU
///////////////////////////


//Input
show_ich = input(false, title='--------Show Ichimoku---------')
tenkanIN = input.int(9, minval=1, title='Tenkan')
kijunIN = input.int(26, minval=1, title='Kijun')
spanBIN = input.int(52, minval=1, title='Span B')
chikouIN = input.int(26, minval=1, title='Chikou')
srcI = input(close, title='Source')


//Setting
donchian(len) =>
    math.avg(ta.lowest(len), ta.highest(len))
tenkan = donchian(tenkanIN)
kijun = donchian(kijunIN)
spanA = math.avg(tenkan, kijun)
spanB = donchian(spanBIN)
chikou = srcI
offset = -chikouIN

Color00 = #f57f17  //Orange
Color02 = #f57f17ff  //Orange 100%
Color10 = #006400  //Green
Color13 = #388e3c  //Light Green
Color20 = #8B0000  //Red
Color23 = #b71c1c  //Light Red
Color30 = #ffffff  //White

colorKumo = spanA > spanB ? Color10 : Color20

//Drawing
plot(show_ich ? tenkan : na, title='Tenkan', color=color.new(Color10, 0))
plot(show_ich ? kijun : na, title='Kijun', color=color.new(Color20, 0))
plot(show_ich ? srcI : na, offset=-chikouIN + 1, title='Chikou', color=color.new(Color00, 0), linewidth=2)
kumoA = plot(show_ich ? spanA : na, offset=chikouIN - 1, title='Span A', color=na)
kumoB = plot(show_ich ? spanB : na, offset=chikouIN - 1, title='Span B', color=na)
fill(kumoA, kumoB, title='Kumo', color=show_ich ? colorKumo : na, transp=75)

//////////////////
///// END ICHIMOKU
///////////////////////////	 


//////////////////
/////BUYSELLSIGNALS
///////////////////////////


//Momentum
sz = ta.linreg(close - math.avg(math.avg(ta.highest(high, 20), ta.lowest(low, 20)), ta.sma(close, 20)), 20, 0)
//ADX
adxlen = 14  //input(14,    title = "ADX Smoothing")
dilen = 14  //input(14,    title = "DI Length") 
keyLevel = 23  //input(23,    title = "Key level for ADX")

dirmov(len) =>
    up = ta.change(high)
    down = -ta.change(low)
    truerange = ta.rma(ta.tr, len)
    plus = fixnan(100 * ta.rma(up > down and up > 0 ? up : 0, len) / truerange)
    minus = fixnan(100 * ta.rma(down > up and down > 0 ? down : 0, len) / truerange)
    [plus, minus]

adx(dilen, adxlen) =>
    [plus, minus] = dirmov(dilen)
    sum = plus + minus
    adx = 100 * ta.rma(math.abs(plus - minus) / (sum == 0 ? 1 : sum), adxlen)
    [adx, plus, minus]

[adxValue, diplus, diminus] = adx(dilen, adxlen)

lbR = input(title='Pivot Lookback Right', defval=1)
lbL = input(title='Pivot Lookback Left', defval=1)

//FUNCTIONS
plFound(osc) =>
    na(ta.pivotlow(osc, lbL, lbR)) ? false : true
phFound(osc) =>
    na(ta.pivothigh(osc, lbL, lbR)) ? false : true

//pivots ADX AND SZ

//buy_cond= plFound(sz) and adxValue < adxValue[1] ? true : phFound(adxValue) and sz >= sz[1] and sz<0 ? true : false

//sell_cond= phFound(sz) and adxValue < adxValue[1] ? true : phFound(adxValue) and sz < sz[1] and sz>0? true : false

buy_cond1 = plFound(sz) and adxValue < adxValue[1] ? true : false
buy_cond2 = phFound(adxValue) and sz >= sz[1] and sz < 0 ? true : false

buy_c = buy_cond1 or buy_cond2


sell_cond1 = phFound(sz) and adxValue < adxValue[1] ? true : false
sell_cond2 = phFound(adxValue) and sz < sz[1] and sz > 0 ? true : false

sell_c = sell_cond1 or sell_cond2

///ALERTAS





plotshape(ShowBuySellArrows and buy_c, 'Buy', shape.square, location.belowbar, color.new(color.green, 0), text='Buy', textcolor=color.new(color.green, 0))
plotshape(ShowBuySellArrows and sell_c, 'Sell', shape.square, location.abovebar, color.new(color.red, 0), text='Sell', textcolor=color.new(color.red, 0))





/////////////////////////////////////////////
//////////////Whale detector by blackcat
////////////////////////////////////
emawhale = input(title='Whale value', defval=30)

//functions
xrf(values, length) =>
    r_val = float(na)
    if length >= 1
        for i = 0 to length by 1
            if na(r_val) or not na(values[i])
                r_val := values[i]
                r_val
    r_val

xsa(src, len, wei) =>
    sumf = 0.0
    ma = 0.0
    out = 0.0
    sumf := nz(sumf[1]) - nz(src[len]) + src
    ma := na(src[len]) ? na : sumf / len
    out := na(out[1]) ? ma : (src * wei + out[1] * (len - wei)) / len
    out

//trend follower algorithm
var2 = xrf(low, 1)
var3 = xsa(math.abs(low - var2), 3, 1) / xsa(math.max(low - var2, 0), 3, 1) * 100
var4 = ta.ema(close * 1.2 ? var3 * 10 : var3 / 10, 3)
var5 = ta.lowest(low, emawhale)
var6 = ta.highest(var4, emawhale)
lowest_1 = ta.lowest(low, 58)
var7 = lowest_1 ? 1 : 0
var8 = ta.ema(low <= var5 ? (var4 + var6 * 2) / 2 : 0, 3) / 618 * var7

//whale pump detector


///////////

var21 = xrf(high, 1)
var31 = xsa(math.abs(high - var21), 3, 1) / xsa(math.max(high - var21, 0), 3, 1) * 100
var41 = ta.ema(close * 1.2 ? var31 * 10 : var31 / 10, 3)
var51 = ta.highest(high, emawhale)
var61 = ta.lowest(var41, emawhale)
highest_1 = ta.highest(high, 58)
var71 = highest_1 ? 1 : 0
var81 = ta.ema(high >= var51 ? (var41 + var61 * 2) / 2 : 0, 3) / 618 * var71

aguas = phFound(var81) ? true : false

///////////

whale = phFound(var8) ? true : false

//plotshape(aguas and show_admin ? true : na, text='❗', style=shape.arrowdown, color=color.new(color.red, 0), location=location.abovebar)


//plotshape(whale and show_whale ? true : na, style=shape.triangleup, text='🐳', color=color.new(color.blue, 0), location=location.belowbar)


plotchar(show_whalec and whale , title = "whale", char = "🐳",location=location.belowbar,size = size.tiny)
plotchar(show_adminc and aguas, title = "whale invert", char = "❗",location=location.abovebar,size = size.tiny)


//////////////////////////
///////// DIVERGENCIAS
/////////////////////



show_div = input(false, title='------Divergencias--------')
//lbR = input(title="Pivot Lookback Right", defval=1)
//lbL = input(title="Pivot Lookback Left", defval=1)
rangeUpper = input(title='Max of Lookback Range', defval=60)
rangeLower = input(title='Min of Lookback Range', defval=1)
plotBull = input(title='Plot Bullish', defval=true)
plotHiddenBull = input(title='Plot Hidden Bullish', defval=true)
plotBear = input(title='Plot Bearish', defval=true)
plotHiddenBear = input(title='Plot Hidden Bearish', defval=true)


bearColor = #ff0000
bullColor = #1bff00
hiddenBullColor = #a4ff99
hiddenBearColor = #ff9e9e
textColor = color.white
noneColor = color.new(color.white, 100)

//FUNCTIONS


_inRange(cond) =>
    bars = ta.barssince(cond == true)
    rangeLower <= bars and bars <= rangeUpper


_findDivRB(osc) =>
    // Osc: Higher Low
    oscHL = osc[lbR] > ta.valuewhen(plFound(osc), osc[lbR], 1) and _inRange(plFound(osc)[1])

    // Price: Lower Low
    priceLL = low[lbR] < ta.valuewhen(plFound(osc), low[lbR], 1)

    bullCond = plotBull and priceLL and oscHL and plFound(osc)


    //------------------------------------------------------------------------------
    // Hidden Bullish

    // Osc: Lower Low
    oscLL = osc[lbR] < ta.valuewhen(plFound(osc), osc[lbR], 1) and _inRange(plFound(osc)[1])

    // Price: Higher Low
    priceHL = low[lbR] > ta.valuewhen(plFound(osc), low[lbR], 1)

    hiddenBullCond = plotHiddenBull and priceHL and oscLL and plFound(osc)



    //------------------------------------------------------------------------------
    // Regular Bearish

    // Osc: Lower High
    oscLH = osc[lbR] < ta.valuewhen(phFound(osc), osc[lbR], 1) and _inRange(phFound(osc)[1])

    // Price: Higher High
    priceHH = high[lbR] > ta.valuewhen(phFound(osc), high[lbR], 1)

    bearCond = plotBear and priceHH and oscLH and phFound(osc)



    //------------------------------------------------------------------------------
    // Hidden Bearish

    // Osc: Higher High
    oscHH = osc[lbR] > ta.valuewhen(phFound(osc), osc[lbR], 1) and _inRange(phFound(osc)[1])

    // Price: Lower High
    priceLH = high[lbR] < ta.valuewhen(phFound(osc), high[lbR], 1)

    hiddenBearCond = plotHiddenBear and priceLH and oscHH and phFound(osc)

    [bullCond, hiddenBullCond, bearCond, hiddenBearCond]




[sz_bullCond, sz_hiddenBullCond, sz_bearCond, sz_hiddenBearCond] = _findDivRB(sz)


foundDivBSZ = plFound(sz) and show_div ? true : false
colordivBSZ = sz_bullCond ? bullColor : sz_hiddenBullCond ? hiddenBullColor : noneColor

textoDivBull = sz_bullCond ? ' | Divergencia alcista' : sz_hiddenBullCond ? ' | Divergencia alcista oculta | ' : ''

foundDivBeSZ = phFound(sz) and show_div ? true : false
colordivBeSZ = sz_bearCond ? bearColor : sz_hiddenBearCond ? hiddenBearColor : noneColor

textoDivBear = sz_bearCond ? ' | Divergencia bajista | ' : sz_hiddenBearCond ? ' | Divergencia bajista oculta | ' : ''

foundDiv = plFound(sz) and sz_bullCond or plFound(sz) and sz_hiddenBullCond or phFound(sz) and sz_bearCond or phFound(sz) and sz_hiddenBearCond ? true : false
plot(foundDivBSZ ? low[lbR] : na, offset=-lbR, title='Regular Bullish', linewidth=1, color=colordivBSZ, transp=0)
plot(foundDivBeSZ ? high[lbR] : na, offset=-lbR, title='Regular Bullish', linewidth=1, color=colordivBeSZ, transp=0)


    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////NADARAYA
    ///////////////////////////////////////////////////////////
show_nadaraya = input(false, title='---------------Show NADARAYA-------------------')

lengthN = input.float(500,'Window Size',maxval=500,minval=0)
h      = input.float(8.,'Bandwidth')
multn   = input.float(3.) 
src    = input.source(close,'Source')


up_col = input.color(#39ff14,'Colors',inline='col')
dn_col = input.color(#ff1100,'',inline='col')

//----
n = bar_index
var k = 2
var uppern = array.new_line(0) 
var lowern = array.new_line(0) 


lset(l,x1,y1,x2,y2,col)=>
    line.set_xy1(l,x1,y1)
    line.set_xy2(l,x2,y2)
    line.set_color(l,col)
    line.set_width(l,2)

if barstate.isfirst 
    for i = 0 to lengthN/k-1
        array.push(uppern,line.new(na,na,na,na))
        array.push(lowern,line.new(na,na,na,na))
//----
line up = na
line dn = na
//----
cross_up = 0.
cross_dn = 0.
if barstate.islast
    y = array.new_float(0)
    
    sum_e = 0.
    for i = 0 to lengthN-1
        sum = 0.
        sumw = 0.
        
        for j = 0 to lengthN-1
            w = math.exp(-(math.pow(i-j,2)/(h*h*2)))
            sum += src[j]*w
            sumw += w
        
        y2 = sum/sumw
        sum_e += math.abs(src[i] - y2)
        array.push(y,y2)

    mae = sum_e/lengthN*multn
    
    for i = 1 to lengthN-1
        y2 = array.get(y,i)
        y1 = array.get(y,i-1)
        
        up := array.get(uppern,i/k)
        dn := array.get(lowern,i/k)
        if show_nadaraya
            lset(up,n-i+1,y1 + mae,n-i,y2 + mae,up_col)
            lset(dn,n-i+1,y1 - mae,n-i,y2 - mae,dn_col)
        
        if src[i] > y1 + mae and src[i+1] < y1 + mae and show_nada
            label.new(n-i,src[i],'▼',color=#00000000,style=label.style_label_down,textcolor=dn_col,textalign=text.align_center)
            
        if src[i] < y1 - mae and src[i+1] > y1 - mae and show_nada
            label.new(n-i,src[i],'▲',color=#00000000,style=label.style_label_up,textcolor=up_col,textalign=text.align_center)
            
    
    cross_up := array.get(y,0) + mae
    cross_dn := array.get(y,0) - mae







    ///////////////////////////////////////////////////////////




///////////////////////////
////////////
////////////////////////
if sell_c or buy_c or whale or foundDiv
    alert = sell_c ? 'Sell alert ' : buy_c ? 'Buy alert ' : ''
    whaleT = whale ? ' 🐳 ' : ''
    alert(whaleT + alert + textoDivBear + textoDivBull + str.tostring(close), freq=alert.freq_once_per_bar_close)
/////////////////////////////////
///////////
/////////////////////////
/////////
///// END SIGNALS
/////









/////////
///// LUPOWN
/////



// Sommi Flag


wtChannelLen = input(9, title='WT Channel Length',group = "Lupown")
wtAverageLen = input(12, title='WT Average Length',group = "Lupown")
wtMASource = input(hlc3, title='WT MA Source',group = "Lupown")
wtMALen = input(3, title='WT MA Length',group = "Lupown")

rsiMFIperiod = input(60, title='MFI Period',group = "Lupown")
rsiMFIMultiplier = input.float(150, title='MFI Area multiplier',group = "Lupown")
rsiMFIPosY = input(2.5, title='MFI Area Y Pos',group = "Lupown")


sommiVwapTF = input('720', title='Wave timeframe',group = "Lupown")
sommiVwapBearLevel = input(0, title='F. Wave Bear Level (less than)',group = "Lupown")
sommiVwapBullLevel = input(0, title='F. Wave Bull Level (more than)',group = "Lupown")
soomiFlagWTBearLevel = input(0, title='WT Bear Level (more than)',group = "Lupown")
soomiFlagWTBullLevel = input(0, title='WT Bull Level (less than)',group = "Lupown")
soomiRSIMFIBearLevel = input(0, title='Money flow Bear Level (less than)',group = "Lupown")
soomiRSIMFIBullLevel = input(0, title='Money flow Bull Level (more than)',group = "Lupown")

// Sommi Diamond

sommiHTCRes = input.timeframe('60', title='HTF Candle Res. 1',group = "Lupown")
sommiHTCRes2 = input.timeframe('240', title='HTF Candle Res. 2',group = "Lupown")
soomiDiamondWTBearLevel = input(0, title='WT Bear Level (More than)',group = "Lupown")
soomiDiamondWTBullLevel = input(0, title='WT Bull Level (Less than)',group = "Lupown")
osLevel = -53
obLevel = 53

// WaveTrend
f_wavetrend(src, chlen, avg, malen, tf) =>
    tfsrc = request.security(syminfo.tickerid, tf, src)
    esa = ta.ema(tfsrc, chlen)
    de = ta.ema(math.abs(tfsrc - esa), chlen)
    ci = (tfsrc - esa) / (0.015 * de)
    wt1 = request.security(syminfo.tickerid, tf, ta.ema(ci, avg))
    wt2 = request.security(syminfo.tickerid, tf, ta.sma(wt1, malen))
    wtVwap = wt1 - wt2
    wtOversold = wt2 <= osLevel
    wtOverbought = wt2 >= obLevel
    wtCross = ta.cross(wt1, wt2)
    wtCrossUp = wt2 - wt1 <= 0
    wtCrossDown = wt2 - wt1 >= 0
    wtCrosslast = ta.cross(wt1[2], wt2[2])
    wtCrossUplast = wt2[2] - wt1[2] <= 0
    wtCrossDownlast = wt2[2] - wt1[2] >= 0
    [wt1, wt2, wtOversold, wtOverbought, wtCross, wtCrossUp, wtCrossDown, wtCrosslast, wtCrossUplast, wtCrossDownlast, wtVwap]

// RSI+MFI
f_rsimfi(_period, _multiplier, _tf) =>
    request.security(syminfo.tickerid, _tf, ta.sma((close - open) / (high - low) * _multiplier, _period) - rsiMFIPosY)


// Get higher timeframe candle
f_getTFCandle(_tf) =>
    _open = request.security(ticker.heikinashi(syminfo.tickerid), _tf, open, barmerge.gaps_off, barmerge.lookahead_on)
    _close = request.security(ticker.heikinashi(syminfo.tickerid), _tf, close, barmerge.gaps_off, barmerge.lookahead_on)
    _high = request.security(ticker.heikinashi(syminfo.tickerid), _tf, high, barmerge.gaps_off, barmerge.lookahead_on)
    _low = request.security(ticker.heikinashi(syminfo.tickerid), _tf, low, barmerge.gaps_off, barmerge.lookahead_on)
    hl2 = (_high + _low) / 2.0
    newBar = ta.change(_open)
    candleBodyDir = _close > _open
    [candleBodyDir, newBar]

// Sommi flag
f_findSommiFlag(tf, wt1, wt2, rsimfi, wtCross, wtCrossUp, wtCrossDown) =>
    [hwt1, hwt2, hwtOversold, hwtOverbought, hwtCross, hwtCrossUp, hwtCrossDown, hwtCrosslast, hwtCrossUplast, hwtCrossDownlast, hwtVwap] = f_wavetrend(wtMASource, wtChannelLen, wtAverageLen, wtMALen, tf)

    bearPattern = rsimfi < soomiRSIMFIBearLevel and wt2 > soomiFlagWTBearLevel and wtCross and wtCrossDown and hwtVwap < sommiVwapBearLevel

    bullPattern = rsimfi > soomiRSIMFIBullLevel and wt2 < soomiFlagWTBullLevel and wtCross and wtCrossUp and hwtVwap > sommiVwapBullLevel

    [bearPattern, bullPattern, hwtVwap]

f_findSommiDiamond(tf, tf2, wt1, wt2, wtCross, wtCrossUp, wtCrossDown) =>
    [candleBodyDir, newBar] = f_getTFCandle(tf)
    [candleBodyDir2, newBar2] = f_getTFCandle(tf2)
    bearPattern = wt2 >= soomiDiamondWTBearLevel and wtCross and wtCrossDown and not candleBodyDir and not candleBodyDir2
    bullPattern = wt2 <= soomiDiamondWTBullLevel and wtCross and wtCrossUp and candleBodyDir and candleBodyDir2
    [bearPattern, bullPattern]
var sommiBullish = false , sommiBullishDiamond = false , sommiBearish =  false , sommiBearishDiamond = false

// RSI + MFI Area
if lpwn
    rsiMFI = f_rsimfi(rsiMFIperiod, rsiMFIMultiplier, timeframe.period)

    // Calculates WaveTrend
    [wt1, wt2, wtOversold, wtOverbought, wtCross, wtCrossUp, wtCrossDown, wtCross_last, wtCrossUp_last, wtCrossDown_last, wtVwap] = f_wavetrend(wtMASource, wtChannelLen, wtAverageLen, wtMALen, timeframe.period)



    // Sommi flag
    [sommiBearish1, sommiBullish1, hvwap] = f_findSommiFlag(sommiVwapTF, wt1, wt2, rsiMFI, wtCross, wtCrossUp, wtCrossDown)

    //Sommi diamond
    [sommiBearishDiamond1, sommiBullishDiamond1] = f_findSommiDiamond(sommiHTCRes, sommiHTCRes2, wt1, wt2, wtCross, wtCrossUp, wtCrossDown)
    sommiBullish := sommiBullish1 , sommiBullishDiamond := sommiBullishDiamond1 , sommiBearish :=  sommiBearish1 , sommiBearishDiamond := sommiBearishDiamond1



plotchar(lpwn and sommiBullish and sommiBullishDiamond, title = "whale", char = "👽",location=location.belowbar,size = size.tiny)
plotchar(lpwn and sommiBearish and sommiBearishDiamond, title = "whale invert", char = "👹",location=location.abovebar,size = size.tiny)
/////////
///// END LUPOEN
/////

























group_support_and_resistance            = 'Consecutively Increasing Volume / Price'
tooltip_support_and_resistance          = 'Moments where\n' + 
                                          '- price is bullish or bearish consecutively for minimum 3 bars and on increasing volume with at least one bar\'s volume is above volume moving average\n' + 
                                          'or\n' + 
                                          '- price is bullish or bearish consecutively on increasing/decreasing price for minimum 3 bars'

group_volume_spike_sign_of_exhaustion   = 'Volume Spike - Sign of Exhaustion'
tooltip_volume_spike_sign_of_exhaustion = 'Moments where\n' + 
                                          'huge volume detected : current volume is grater than the product of the theshold value and volume moving average\n' + 
                                          'presents idea : huge volume may be a sign of exhaustion and may lead to sharp reversals'

group_high_volatility                   = 'High Volatility'
tooltip_high_volatility                 = 'Moments where\n' + 
                                           'price range of the current bar is grater than the product of the theshold value and average true range value of defined period'

group_volume_weighted_colored_bars      = 'Volume Weighted Colored Bars'
tooltip_volume_weighted_colored_bars    = 'Colors bars based on the bar\'s volume relative to volume moving average\n' + 
                                          'trading tip : a potential breakout trading opportunity may occur when price moves above a resistance level or moves below a support level on increasing volume'

tooltip_volume_moving_average           = 'Volume simple moving average, serves as reference to\n' + 
                                          '- Support and Resistance,\n' + 
                                          '- Volume Weighted Colored Bars,\n' + 
                                          '- Volume Spike - Sign of Exhaustion\ncalculations'

// User Input Declarations ---------------------------------------------------------------------- //

// ---------------------------------------------------------------------------------------------- //
// Consecutively Increasing Volume / Price  ----------------------------------------------------- //










group_volume_profile    = 'Volume Profile / Price by Volume'
tooltip_volume_profile  = 'Volume Profile (also known as Price by Volume) is an charting study that displays trading activity over a specified time period at specific price levels'

volumeProfile     = input.bool(true, '-----------------Volume Profile---------------------', group = group_volume_profile, tooltip = tooltip_volume_profile)

vpLookbackRange   = input.string('Fixed Range', 'VP and SD Lookback Range', options = ['Fixed Range', 'Visible Range'], group = group_volume_profile)
lookbackLength    = input.int(200, 'VP and SD Fixed Range : Lookback Length', minval = 10, maxval = 5000, step = 10  , group = group_volume_profile)
avgVolNodeCol     = input.color(color.new(#787b86, 25), 'Volume Nodes : AVN'        , inline='col', group = group_volume_profile)
highVolNodeCol    = input.color(color.new(#f57c00, 50), 'HVN'                       , inline='col', group = group_volume_profile)
lowVolNodeCol     = input.color(color.new(#787b86, 75), 'LVN'                       , inline='col', group = group_volume_profile)
isValueArea       = input.float(68, "Value Area Volume %", minval = 0, maxval = 100               , group = group_volume_profile) / 100
valueAreaHigh     = input.bool(false, 'VAH'                                          , inline='VA' , group = group_volume_profile)
vahColor          = input.color(color.new(#ffeb3b, 0), ''                           , inline='VA' , group = group_volume_profile)
pointOfControl    = input.bool(true, 'POC'                                          , inline='VA' , group = group_volume_profile)
pocColor          = input.color(color.new(#ff0000, 0), ''                           , inline='VA' , group = group_volume_profile)
valueAreaLow      = input.bool(false, 'VAL'                                          , inline='VA' , group = group_volume_profile)
valColor          = input.color(color.new(#ffeb3b, 0), ''                           , inline='VA' , group = group_volume_profile)
priceLevels       = false// input.bool(true, 'Show Profile Price Levels     '               , inline='BBe', group = group_volume_profile)
labelColor        = input.color(color.new(#8c92a4, 0), ''                           , inline='BBe', group = group_volume_profile)
profileLevels     = input.int(100, 'Number of Rows' , minval = 10, maxval = 170 , step = 10       , group = group_volume_profile)
horizontalOffset  = input.int(1, 'Horizontal Offset', minval = 0 , maxval = 100                  , group = group_volume_profile)

tooltip_sd        = 'Defines the relationship between the price of a given asset and the willingness of traders to either buy or sell it'
group_supply_demand = 'Supply and Demand Settings'
supplyDemand      = input.bool(false, 'Supply and Demand Zones'                      , inline='low2', group = group_supply_demand, tooltip = tooltip_sd)
lowVolNodesVal    = input.int(15, '' , minval = 0, maxval = 50, step = 1            , inline='low2', group = group_supply_demand) / 100
supplyDemandCol   = input.color(color.new(#512da8, 80), ''                          , inline='low2', group = group_supply_demand)

priceHighestFR    = ta.highest(high, lookbackLength)
priceLowestFR     = ta.lowest (low , lookbackLength)




// ---------------------------------------------------------------------------------------------- //
// Definitions ---------------------------------------------------------------------------------- //

nzVolume  = nz(volume)
risingVol = nzVolume >= nzVolume[1]

bullCandle = close > open
bearCandle = close < open

risingPrice  = close > close[1]
fallingPrice = close < close[1]

lwstPrice = ta.lowest (low , 3)
hstPrice  = ta.highest(high, 3)

//weightedATR = i_atrMult * ta.atr(i_atrLength)
range_1     = math.abs(high - low)

x2 = timenow + 7 * math.round(ta.change(time))





var startBarIndexX = 0
if time == chart.left_visible_bar_time and vpLookbackRange == 'Visible Range'
    startBarIndexX := bar_index

if vpLookbackRange == 'Visible Range'
    lookbackLength    := last_bar_index -  startBarIndexX
f_drawLabelX(_x, _y, _text, _xloc, _yloc, _color, _style, _textcolor, _size, _textalign, _tooltip) =>
    var id = label.new(_x, _y, _text, _xloc, _yloc, _color, _style, _textcolor, _size, _textalign, _tooltip)
    label.set_xy(id, _x, _y)
    label.set_text(id, _text)
    label.set_tooltip(id, _tooltip)
    label.set_textcolor(id, _textcolor)

f_drawLineX(_x1, _y1, _x2, _y2, _xloc, _extend, _color, _style, _width) =>
    var id = line.new(_x1, _y1, _x2, _y2, _xloc, _extend, _color, _style, _width)
    line.set_xy1(id, _x1, _y1)
    line.set_xy2(id, _x2, _y2)
    line.set_color(id, _color)
    
f_getHighLow() =>
    var htf_h  = 0., var htf_l  = 0.
    
    if vpLookbackRange == 'Visible Range'
        if time == chart.left_visible_bar_time
            htf_l := low 
            htf_h := high
        else if time > chart.left_visible_bar_time
            htf_l := math.min(low , htf_l)
            htf_h := math.max(high, htf_h)
    else
        htf_h := priceHighestFR
        htf_l := priceLowestFR

    [htf_h, htf_l]

[priceHighest, priceLowest] = f_getHighLow()
priceStep         = (priceHighest - priceLowest) / profileLevels
barPriceLow       = low
barPriceHigh      = high
var levelAbovePoc = 0
var levelBelowPoc = 0
var pocLevel      = 0

volumeStorage     = array.new_float(profileLevels + 1, 0.)
volumeStorageB    = array.new_float(profileLevels + 1, 0.)
var a_profile     = array.new_box()

if barstate.islast and nzVolume
    if array.size(a_profile) > 0
        for i = 1 to array.size(a_profile)
            box.delete(array.shift(a_profile))

    for barIndex = 0 to lookbackLength - 1
        level = 0
        for priceLevel = priceLowest to priceHighest by priceStep
            if barPriceHigh[barIndex] >= priceLevel and barPriceLow[barIndex] < priceLevel + priceStep
                array.set(volumeStorage, level, array.get(volumeStorage, level) + nzVolume[barIndex] * ((barPriceHigh[barIndex] - barPriceLow[barIndex]) == 0 ? 1 : priceStep / (barPriceHigh[barIndex] - barPriceLow[barIndex])) )

                if bullCandle[barIndex]
                    array.set(volumeStorageB, level, array.get(volumeStorageB, level) + nzVolume[barIndex] * ((barPriceHigh[barIndex] - barPriceLow[barIndex]) == 0 ? 1 : priceStep / (barPriceHigh[barIndex] - barPriceLow[barIndex])) )
            level += 1

    pocLevel  := array.indexof(volumeStorage, array.max(volumeStorage))
    totalVolumeTraded = array.sum(volumeStorage) * isValueArea
    valueArea  = array.get(volumeStorage, pocLevel)

    levelAbovePoc := pocLevel
    levelBelowPoc := pocLevel
    
    while valueArea < totalVolumeTraded
        if levelBelowPoc == 0 and levelAbovePoc == profileLevels - 1
            break

        volumeAbovePoc = 0.
        if levelAbovePoc < profileLevels - 1 
            volumeAbovePoc := array.get(volumeStorage, levelAbovePoc + 1)

        volumeBelowPoc = 0.
        if levelBelowPoc > 0
            volumeBelowPoc := array.get(volumeStorage, levelBelowPoc - 1)
        
        if volumeAbovePoc >= volumeBelowPoc
            valueArea     += volumeAbovePoc
            levelAbovePoc += 1
        else
            valueArea     += volumeBelowPoc
            levelBelowPoc -= 1

    f_drawLineX(bar_index - lookbackLength + 1, priceLowest + (levelAbovePoc + 1.00) * priceStep, volumeProfile ? bar_index + horizontalOffset + 50 : bar_index + 7, priceLowest + (levelAbovePoc + 1.00) * priceStep, xloc.bar_index, extend.none, valueAreaHigh  ? vahColor : #00000000, line.style_solid, 2)
    f_drawLineX(bar_index - lookbackLength + 1, priceLowest + (pocLevel      + 0.50) * priceStep, volumeProfile ? bar_index + horizontalOffset + 50 : bar_index + 7, priceLowest + (pocLevel      + 0.50) * priceStep, xloc.bar_index, extend.none, pointOfControl ? pocColor : #00000000, line.style_solid, 2)
    f_drawLineX(bar_index - lookbackLength + 1, priceLowest + (levelBelowPoc + 0.00) * priceStep, volumeProfile ? bar_index + horizontalOffset + 50 : bar_index + 7, priceLowest + (levelBelowPoc + 0.00) * priceStep, xloc.bar_index, extend.none, valueAreaLow   ? valColor : #00000000, line.style_solid, 2)

    if priceLevels
        f_drawLabelX(volumeProfile ? bar_index + horizontalOffset + 50 : bar_index + 7, priceHighest, str.tostring(priceHighest, format.mintick), xloc.bar_index, yloc.price, labelColor, label.style_label_down, labelColor, size.normal, text.align_left, 'Profile High - during last ' + str.tostring(lookbackLength) + ' bars\n %' + str.tostring((priceHighest - priceLowest) / priceLowest  * 100, '#.##') + ' higher than the Profile Low')
        f_drawLabelX(volumeProfile ? bar_index + horizontalOffset + 50 : bar_index + 7, priceLowest , str.tostring(priceLowest , format.mintick), xloc.bar_index, yloc.price, labelColor, label.style_label_up  , labelColor, size.normal, text.align_left, 'Profile Low - during last '  + str.tostring(lookbackLength) + ' bars\n %' + str.tostring((priceHighest - priceLowest) / priceHighest * 100, '#.##') + ' lower than the Profile High')
        f_drawLabelX(volumeProfile ? bar_index + horizontalOffset + 57 : bar_index + 13, priceLowest + (levelAbovePoc + 1.00) * priceStep, str.tostring(priceLowest + (levelAbovePoc + 1.00) * priceStep, format.mintick), xloc.bar_index, yloc.price, valueAreaHigh  ? labelColor : #00000000, label.style_label_left, valueAreaHigh  ? labelColor : #00000000, size.normal, text.align_left, 'Value Area High Price')
        f_drawLabelX(volumeProfile ? bar_index + horizontalOffset + 57 : bar_index + 13, priceLowest + (pocLevel      + 0.50) * priceStep, str.tostring(priceLowest + (pocLevel      + 0.50) * priceStep, format.mintick), xloc.bar_index, yloc.price, pointOfControl ? labelColor : #00000000, label.style_label_left, pointOfControl ? labelColor : #00000000, size.normal, text.align_left, 'Point Of Control Price')
        f_drawLabelX(volumeProfile ? bar_index + horizontalOffset + 57 : bar_index + 13, priceLowest + (levelBelowPoc + 0.00) * priceStep, str.tostring(priceLowest + (levelBelowPoc + 0.00) * priceStep, format.mintick), xloc.bar_index, yloc.price, valueAreaLow   ? labelColor : #00000000, label.style_label_left, valueAreaLow   ? labelColor : #00000000, size.normal, text.align_left, 'Value Area Low Price')

    for level = 0 to profileLevels - 1
        if volumeProfile
            levelColor =  array.get(volumeStorage, level) / array.max(volumeStorage) > .8 ? highVolNodeCol : array.get(volumeStorage, level) / array.max(volumeStorage) < .2 ? lowVolNodeCol : avgVolNodeCol 
            array.push(a_profile, box.new( bar_index + horizontalOffset + 49 - int( array.get(volumeStorage, level) / array.max(volumeStorage) * 41), priceLowest + (level + 0.25) * priceStep, 
                                       bar_index + horizontalOffset + 50, priceLowest + (level + 0.75) * priceStep, levelColor, bgcolor = levelColor ))
            bullBearPower  = 2 * array.get(volumeStorageB, level) - array.get(volumeStorage, level)
            //array.push(a_profile, box.new(bar_index + horizontalOffset + 51 , priceLowest + (level + 0.25) * priceStep, 
             //                         bar_index + horizontalOffset + 51 + (bullBearPower > 0 ? 1 : -1) * int( bullBearPower / array.max(volumeStorage) * 73), priceLowest + (level + 0.75) * priceStep, bullBearPower > 0 ? color.new(#26a69a, 50) : color.new(#ef5350, 50), bgcolor = bullBearPower > 0 ? color.new(#26a69a, 50) : color.new(#ef5350, 50) ))

        if supplyDemand
            if array.get(volumeStorage, level) / array.max(volumeStorage) < lowVolNodesVal
                array.push(a_profile, box.new(bar_index - lookbackLength + 1, priceLowest + (level + 0.00) * priceStep, bar_index + 7, priceLowest + (level + 1.00) * priceStep, #00000000, bgcolor = supplyDemandCol ))

    if volumeProfile
        array.push(a_profile, box.new(bar_index - lookbackLength + 1, priceLowest, bar_index + horizontalOffset + 50, priceHighest, color.new(color.gray, 37), 1, line.style_dotted, bgcolor=#00000000 ))
































// === Tooltip text ===

var vartooltip = 'Indicator to help identifying instituational Order Blocks. Often these blocks signal the beginning of a strong move, but there is a high probability, that these prices will be revisited at a later point in time again and therefore are interesting levels to place limit orders. \nBullish Order block is the last down candle before a sequence of up candles. \nBearish Order Block is the last up candle before a sequence of down candles. \nIn the settings the number of required sequential candles can be adjusted. \nFurthermore a %-threshold can be entered which the sequential move needs to achieve in order to validate a relevant Order Block. \nChannels for the last Bullish/Bearish Block can be shown/hidden.'

/////////////////////////////////
////////////fvg
/////////////////////////////////

// Mark FVGs is marking FVG (stands for Fair Value Gap, other name is Imbalance or IMB) on your chart so that you can instantly detect them 
// It supports:  
//   - marking bullish and bearish partly filled or unfilled FVGs of the current timeframe
//   - marking bullish and bearish already filled FVGs of the current timeframe
//   - marking bullish and bearish FVGs of the any 4 timeframes on your current timeframe
// technically it re-builds them on the last bar or as soon as new realtime bar is updated. it looks with 1k bars back to find the nearest specific number of FGVs 
// Adjustments:
//   - changing the maximum number of FVGs to display. 
//   - changing the color of FVG area
//   - displaying already filled FVG of the current time frame
//   - changing the mode of displaying area it can either extended or fixed width
//   - displaying labels of other time frame FVGs
 





version = 'v3.0'
int mbp = 1000
//indicator("Mark FVGs", overlay = true, max_lines_count = 500, max_bars_back = mbp, max_labels_count = 500)


showFVG = input.bool(false, '----------- Show FVG------------')
max_bars_back(time, mbp)
max_bars_back(low, mbp)
max_bars_back(close, mbp)
max_bars_back(open, mbp)
max_bars_back(high, mbp)

// Settings
//{
FvgCat = 'Release ' + version

defFvgColor = color.new(#721010, 90)
defFvgColor2 = color.new(#107228, 90)
noColor = color.new(color.white, 100)
beName = 'Be'
buName = 'Bu'
maxImbs = input.int(10, 'Max', group = FvgCat, minval = 1, maxval = 100, inline = 'gen')
fvg_middleBar = input.bool(true, 'Mid Bar Start', group = FvgCat, inline = 'gen')
fvg_borders = input.bool(false, 'Borders', tooltip = 'Max - Maximum bearish and bullish FVGs to show\n\nMid Bar Start - Starts drawing FVG zone from the middle candle otherwise it starts drawing it from previous candle\n\nBorders - Displays FVG area borders', group = FvgCat, inline = 'gen')

colorTip =  ':\n   ' + beName + ' - bearish FVG color\n   ' + buName + ' - bullish FVG color'
fvg_be_shared = input.color(color.new(#ff2525, 80), 'Shared Colors: ' + beName + '/' + buName, group = FvgCat, inline = '0')
fvg_bu_shared = input.color(color.new(color.green, 80), '/', group = FvgCat, inline = '0', tooltip = 'Shared Colors' + colorTip)

CurrentCat = 'Current TimeFrame'
UWName = 'UBars'
extendName = 'Extend'
eo_Unextended = 'Unextended'
eo_BySceen = 'By Screen'
eo_ByLastBar = 'By Last Bar'

eo_None = 'None'
eo_ByFilledBar = 'Filling Candle'
custColorName = 'Cust Colors'
onTip = 'Shows/Hides chosen TF'
custColorTip = custColorName + colorTip
extendTip = extendName + ':\n   ' + eo_Unextended + ' - shows fixed FVG area\n   ' + eo_BySceen + ' - extends FVG area all the way to the right\n   ' + eo_ByLastBar + ' - extends FVG area to the last bar\n\nEnables/Disables custom colors\n\n' + custColorTip


chooseColor2(con, shc, c) => con ? c : shc
fvgVisible = input.bool(true, 'On', group = CurrentCat, inline = CurrentCat)
fvg_uw = input.int(0, UWName, group = CurrentCat, minval = -100, maxval = 100, inline = CurrentCat, tooltip = onTip + '\n\n' + UWName + ' - additonal bars for the unextended area')
customColorName = custColorName + ': ' + beName + '/' + buName

fvg_ext = input.string(eo_BySceen, extendName, options = [eo_Unextended, eo_BySceen, eo_ByLastBar], group = CurrentCat, inline = '1')
fvg_custcolor = input.bool(false, customColorName, group = CurrentCat, inline = '1')
fvg_bec = chooseColor2(fvg_custcolor, fvg_be_shared, input.color(defFvgColor, '', group = CurrentCat, inline = '1'))
fvg_buc = chooseColor2(fvg_custcolor, fvg_bu_shared, input.color(defFvgColor2, '/', group = CurrentCat, inline = '1', tooltip = extendTip))

filledName = 'Filled'
fvg_f = input.bool(false, filledName, group = CurrentCat, inline = '0')
fvg_cc = input.bool(false, customColorName, group = CurrentCat, inline = '0')
fvg_f_bec = chooseColor2(fvg_cc, fvg_bec, input.color(defFvgColor, '', group = CurrentCat, inline = '0'))
fvg_f_buc = chooseColor2(fvg_cc, fvg_buc, input.color(defFvgColor2, '/', group = CurrentCat, inline = '0', tooltip = filledName + ' - shows/hides filled area\n\n' + custColorTip))
//fvg_f = input.bool(false, 'filled', group = CurrentCat, inline = '0')
ff_FilledFVGsBack = 'Max Fills'
ff_FVGsBack = 'Last Unfilled'
fTip = 'From:\n   ' + ff_FVGsBack + ' - shows filled FVGs by the first unfilled FVG\n   ' + ff_FilledFVGsBack + ' - sets max filled FVGs to show\n\nMax fills, used when ' + ff_FilledFVGsBack+ ' option is chosen\n\nTo:\n   ' + eo_ByFilledBar + '- filled area is clipped by filling bar\n   ' + eo_Unextended + ' - show fixed FVG area\n\n'
fvg_ff = input.string(ff_FVGsBack, 'From', options = [ff_FVGsBack, ff_FilledFVGsBack], group = CurrentCat, inline = '2')
fvg_fmax = input.int(10, '', minval = 1, maxval = 250, group = CurrentCat, inline = '2')
fvg_ft = input.string(eo_ByFilledBar, 'To', options = [eo_ByFilledBar, eo_Unextended], group = CurrentCat, inline = '2', tooltip = fTip)

labelName = 'Name'
timeframeTip = onTip + '\n\nTimeframe to display'
labelsTip = UWName + ' - additonal bars for the unextended area\n\n' + labelName + ' - displays the time frame name\n\nAdds extra text data to the label'

var imbHighs = array.new<box>()
var imbLows = array.new<box>()
var labels = array.new<label>()

maxBars = mbp - 1
if maxBars >= bar_index
    maxBars := bar_index - 1
    
//}
        
FindCurTFImb(on, be_col, bu_col, m, uw, sh_be_col, sh_bu_col) =>
    if barstate.islast and on and showFVG
        maxLows = maxImbs
        maxHighs = maxImbs
        ml = low[0]
        mh = high[0]
        max = m
        t0 = bar_index
        int bear0 = max - 2
        int bull0 = max - 2
        for i = 1 to max - 2
            t = bar_index[i + 1]
            l = low[i]
            nl = low[i + 1]
            h = high[i]
            nh = high[i + 1]
            if maxLows > 0
                if nh < ml
                    lowImb = box.new(fvg_middleBar ? t + 1 : t, ml, fvg_ext == eo_ByLastBar ? bar_index + uw : t + 2 + uw, nh, border_color = fvg_borders ? bu_col : na, bgcolor = bu_col, extend = fvg_ext == eo_BySceen ? extend.right : extend.none)
                    array.push(imbLows, lowImb)
                    maxLows -= 1
                    bull0 := i
                if ml > nh and nh < l//for the gap
                    ml := nh
                if l < ml
                    ml := l
            if maxHighs > 0
                if nl > mh
                    highImb = box.new(fvg_middleBar ? t + 1 : t, nl, fvg_ext == eo_ByLastBar ? bar_index + uw : t + 2 + uw, mh, border_color = fvg_borders ? be_col : na, bgcolor = be_col, extend = fvg_ext == eo_BySceen ? extend.right : extend.none)
                    array.push(imbHighs, highImb)
                    maxHighs -= 1
                    bear0 := i
                if mh < nl and nl > h
                    mh := nl
                if mh < h
                    mh := h
            if maxHighs <= 0 and maxLows <= 0
                break
        if fvg_f
            if fvg_ff == ff_FVGsBack
                i = bull0
                while i > 0
                    nl = low[i - 1]//from the right
                    ph = high[i + 1]//from the left
                    if ph < nl and i > 1
                        ml := nl
                        left = bar_index - i - 1
                        for j = i - 2 to 0
                            if low[j] < ml
                                right = bar_index - j
                                if fvg_ft == eo_Unextended
                                    right := left + uw + 2
                                lowImb = box.new(left + (fvg_middleBar ? 1 : 0), ml, right, math.max(ph, low[j]), border_color = fvg_borders ? sh_bu_col : na, bgcolor = sh_bu_col, extend = extend.none)
                                array.push(imbLows, lowImb)
                                ml := low[j]
                            if ml <= ph
                                break
                    i -= 1
                i := bear0
                while i > 0
                    nh = high[i - 1]//from the right
                    pl = low[i + 1]//from the left
                    if nh < pl and i > 1
                        mh := nh
                        left = bar_index - i - 1
                        for j = i - 2 to 0
                            if high[j] > mh
                                right = bar_index - j
                                if fvg_ft == eo_Unextended
                                    right := left + uw + 2
                                highImb = box.new(left + (fvg_middleBar ? 1 : 0), mh, right, math.min(pl, high[j]), border_color = fvg_borders ? sh_be_col : na, bgcolor = sh_be_col, extend = extend.none)
                                array.push(imbHighs, highImb)
                                mh := high[j]
                            if mh >= pl
                                break
                    i -= 1
            else      
                i = 1
                fvgs = 0
                while fvgs < fvg_fmax and i < mbp
                    nl = low[i - 1]//from the right
                    ph = high[i + 1]//from the left
                    if ph < nl and i > 1
                        ml := nl
                        left = bar_index - i - 1
                        fills = 0
                        for j = i - 2 to 0
                            if low[j] < ml
                                right = bar_index - j
                                if fvg_ft == eo_Unextended
                                    right := left + uw + 2
                                lowImb = box.new(left + (fvg_middleBar ? 1 : 0), ml, right, math.max(ph, low[j]), border_color = fvg_borders ? sh_bu_col : na, bgcolor = sh_bu_col, extend = extend.none)
                                array.push(imbLows, lowImb)
                                ml := low[j]
                                fills += 1
                            if ml <= ph
                                break
                        if fills > 0
                            fvgs += 1
                    i += 1
                i := 1
                fvgs := 0
                while fvgs < fvg_fmax and i < mbp
                    nh = high[i - 1]//from the right
                    pl = low[i + 1]//from the left
                    if nh < pl and i > 1
                        mh := nh
                        left = bar_index - i - 1
                        fills = 0
                        for j = i - 2 to 0
                            if high[j] > mh
                                right = bar_index - j
                                if fvg_ft == eo_Unextended
                                    right := left + uw + 2
                                highImb = box.new(left + (fvg_middleBar ? 1 : 0), mh, right, math.min(pl, high[j]), border_color = fvg_borders ? sh_be_col : na, bgcolor = sh_be_col, extend = extend.none)
                                array.push(imbHighs, highImb)
                                mh := high[j]
                                fills += 1
                            if mh >= pl
                                break
                        if fills > 0
                            fvgs += 1
                    i += 1

createTextLabel(tf) =>
    r = tf
    if str.contains(tf, 'M') or str.contains(tf, 'D') or str.contains(tf, 'Y') or str.contains(tf, 'W') or str.contains(tf, 's')
        r := tf
    else
        s = timeframe.in_seconds(tf)
        s /= 60
        if s / 60 >= 1
            r := str.tostring(s / 60) + 'H'
        else
            r := tf + 'm'
    r
    
createLabel(x, y, txt, tcol, extend) =>
    label.new(x, y, txt, size = size.small, textcolor = tcol, color = noColor, style = label.style_label_left)
    
FindLtfImb(tf, on, be_col, bu_col, max, extend, uw, showlabel, labeltxt) =>
    wrongltf = not on or timeframe.in_seconds(tf) >= timeframe.in_seconds(timeframe.period)
    ts = request.security_lower_tf(syminfo.tickerid, wrongltf ? timeframe.period : tf, time)
    hs = request.security_lower_tf(syminfo.tickerid, wrongltf ? timeframe.period : tf, high)
    ls = request.security_lower_tf(syminfo.tickerid, wrongltf ? timeframe.period : tf, low)
    
    if barstate.islast and not wrongltf
        txt = createTextLabel(tf) + labeltxt
        maxLows = maxImbs
        maxHighs = maxImbs
        float ml = na
        float mh = na
        float h = na
        float nh = na
        float l = na
        float nl = na
        int t = na
        int nt = na
        int t0 = na
        
        for j = 0 to max - 1
            s = array.size(ts[j])
            if (maxHighs == 0 and maxLows == 0) or s == 0
                break
            for i = 0 to s - 1
                if not na(nl)
                    l := nl
                    h := nh
                    t := nt
                nl := array.get(ls[j], s - 1 - i)
                nh := array.get(hs[j], s - 1 - i)
                nt := array.get(ts[j], s - 1 - i)
                if na(t0)
                    t0 := nt
                
                //label.new(nt, h, str.tostring(i), xloc = xloc.bar_time)
                if na(t)
                    continue
                left = bar_index - j
                right = extend == eo_ByLastBar ? bar_index + uw : bar_index - j + uw
                if maxLows > 0
                    //if l < ml and h > ml
                    if nh < ml
                        lowImb = box.new(left, ml, right, nh, border_color = fvg_borders ? bu_col : na, bgcolor = bu_col, extend = extend == eo_BySceen ? extend.right : extend.none)
                        array.push(imbLows, lowImb)
                        if showlabel
                            array.push(labels, createLabel(right, (ml + nh) / 2, txt, color.new(bu_col, color.t(bu_col) / 2), extend))
                        maxLows -= 1
                    if ml > nh and nh < l//for the gap
                        ml := nh
                    if na(ml) or l < ml
                        ml := l
                if maxHighs > 0
                    //if l < mh and h > mh
                    if nl > mh
                        highImb = box.new(left, nl, right, mh, border_color = fvg_borders ? be_col : na, bgcolor = be_col, extend = extend  == eo_BySceen ? extend.right : extend.none)
                        array.push(imbHighs, highImb)
                        if showlabel
                            array.push(labels, createLabel(right, (nl + mh) / 2, txt, color.new(be_col, color.t(be_col) / 2), extend))
                        maxHighs -= 1
                    if mh < nl and nl > h
                        mh := nl
                    if na(mh) or mh < h
                        mh := h
                if maxHighs <= 0 and maxLows <= 0
                    break


FindHtfImb(tf, on, be_col, bu_col, max, extend, uw, showlabel, labeltxt) =>
    wronghtf = not on or timeframe.in_seconds(tf) <= timeframe.in_seconds(timeframe.period)
    [ts, hs, ls] = request.security(syminfo.tickerid, wronghtf ? timeframe.period : tf, [time, high, low], barmerge.gaps_off, barmerge.lookahead_on)
    
    if barstate.islast and not wronghtf
        txt = createTextLabel(tf) + labeltxt
        maxLows = maxImbs
        maxHighs = maxImbs
        float ml = na
        float mh = na
        float h = na
        float nh = na
        float l = na
        float nl = na
        int t = na
        int nj = na
        int cj = na
        j = 0
        while j < max
            if maxHighs <= 0 and maxLows <= 0
                break
            if t != ts[j]
                if not na(nl)
                    l := nl
                    h := nh
                    cj := nj
                nl := ls[j]
                nh := hs[j]
                t := ts[j]
                nj := j
                j += 1
            else 
                if na(t)
                    nl := ls[j]
                    nh := hs[j]
                    t := ts[j]
                    nj := j
                    ml := nl
                    mh := nh
                j += 1
                continue

            left = bar_index - nj + 1
            right = extend == eo_ByLastBar ? bar_index + uw : bar_index - cj + uw
            if maxLows > 0
                if nh < ml
                    lowImb = box.new(left, ml, right, nh, border_color = fvg_borders ? bu_col : na, bgcolor = bu_col, extend = extend  == eo_BySceen ? extend.right : extend.none)
                    array.push(imbLows, lowImb)
                    if showlabel
                        array.push(labels, createLabel(right, (ml + nh) / 2, txt, color.new(bu_col, color.t(bu_col) / 2), extend))
                    maxLows -= 1
                if ml > nh and nh < l//for the gap
                    ml := nh
                if l < ml
                    ml := l
            if maxHighs > 0
                if nl > mh
                    highImb = box.new(left, nl, right, mh, border_color = fvg_borders ? be_col : na, bgcolor = be_col, extend = extend  == eo_BySceen ? extend.right : extend.none)
                    array.push(imbHighs, highImb)
                    if showlabel
                        array.push(labels, createLabel(right, (nl + mh) / 2, txt, color.new(be_col, color.t(be_col) / 2), extend))
                    maxHighs -= 1
                if mh < nl and nl > h
                    mh := nl
                if mh < h
                    mh := h

if barstate.islast
    while array.size(imbLows) > 0
        box.delete(array.pop(imbLows))
    while array.size(imbHighs) > 0
        box.delete(array.pop(imbHighs))
    while array.size(labels) > 0
        label.delete(array.pop(labels))

FindCurTFImb(fvgVisible, fvg_bec, fvg_buc, maxBars, fvg_uw, fvg_f_bec, fvg_f_buc)























//PIVOTES
////////////////////////////////////////////////////////////////////////////////
//
// ====== ABOUT THIS INDICATOR
//
//  - All your common Pivot types in one nifty bundle.
//
//    • Have up to three pivot sets.
//    • Each pivot set has it's own resolution option.
//    • Whatever flavour suits your tastes - each pivot set can be of a
//      different type if you truly wish.
//
// ====== SOURCES and CREDITS
//
//  - All included pivot calcs were sourced from:
//
//    • https://www.tradingview.com/support/solutions/43000521824-pivot-points-standard/
//    • Using the new 'time_close()' function, so thankyou Pine dev's <3
//
// ====== REASON FOR STUDY
//
//  - To practice making scalable code for working with similar datasets.
//
//    • all the reasons
//
// ====== DISCLAIMER
//
//    Any trade decisions you make are entirely your own responsibility.
//    I've made an effort to squash all the bugs, but you never know!
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                       ====== OPTION LIST VARS ======                       //
//                                                                            //
//    * Setting up option list variables outside of the actual input can      //
//      make them much easier to work with if any comparison checks are       //
//      required, and can help keep subsequent code clean and readable.       //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// -- verbose resolution options.
i_res0 = '1 Hour'
i_res1 = '2 Hour'
i_res2 = '3 Hour'
i_res3 = '4 Hour'
i_res4 = '6 Hour'
i_res5 = '12 Hour'
i_res6 = '1 Day'
i_res7 = '5 Day'
i_res8 = '1 Week'
i_res9 = '1 Month'
i_res10 = '3 Month'
i_res11 = '6 Month'
i_res12 = '1 Year'

// -- pivot options
i_piv0 = 'Traditional'
i_piv1 = 'Fibonacci'
i_piv2 = 'Woodie'
i_piv3 = 'Classic'
i_piv4 = 'Demark'
i_piv5 = 'Camarilla'
i_piv6 = 'Fibonacci Extended'

// -- line style options.
i_line0 = 'Solid'
i_line1 = 'Dotted'
i_line2 = 'Dashed'

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                     ====== VAR and ARRAY PRESET ======                     //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// -- Preset INT for maximum amount of S|R levels for any single pivot type.
// NOTE - this variable should only be changed if:
//  • you extend a pivot to have more than 5 levels of S|R
//  • you add a new pivot type wiith more than 5 levels of S|R
var int i_maxLevels = 5

// -- Preset INT for max length of pivot arrays [PP + S max + R max]
//  * NOTE: should not be changed.
var int i_maxLength = 1 + i_maxLevels * 2

// -- Initiate arrays to contain INT variables used in drawing function
//    settings, we fill these at the end of the INPUTS section.
var int[] i_settingsA = array.new_int(3, 0)
//var int[] i_settingsB = array.new_int(3, 0)
//var int[] i_settingsC = array.new_int(3, 0)

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                            ====== INPUTS ======                            //
//                                                                            //
//                     * Using the new 'inline' feature *                     //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// -- Pivots A Main Settings
INP_showPivotsA = input.bool(false, ' -----------------------Show Pivots------------', group='Pivot Set A Settings')
INP_resolutionA = input.string(i_res6, ' ', inline='line1', group='Pivot Set A Settings', options=[i_res0, i_res1, i_res2, i_res3, i_res4, i_res5, i_res6, i_res7, i_res8, i_res9, i_res10, i_res11, i_res12])

INP_supportsA = input.int(2, ' ', inline='line2', group='Pivot Set A Settings', minval=0, maxval=i_maxLevels)
INP_flavourA = input.string(i_piv1, 'S# ', inline='line2', group='Pivot Set A Settings', options=[i_piv0, i_piv1, i_piv2, i_piv3, i_piv4, i_piv5, i_piv6])
INP_resistsA = input.int(2, ' R#', inline='line2', group='Pivot Set A Settings', minval=0, maxval=i_maxLevels)

// -- Pivots B Main Settings

//INP_resolutionB = input( i_res8,    " ",                    inline = "line3",   group = "Pivot Set B Settings",
//      options = [ i_res0, i_res1, i_res2, i_res3, i_res4, i_res5,
//      i_res6, i_res7, i_res8, i_res9, i_res10, i_res11, i_res12
//      ])
//INP_showPivotsB = input( false,     " Show Pivots Set B",   inline = "line3",   group = "Pivot Set B Settings",
//      type = input.bool
//      )
//INP_supportsB   = input( 2,         " ",                    inline = "line4",   group = "Pivot Set B Settings",
//      type = input.integer, minval = 0, maxval = i_maxLevels
//      )
//INP_flavourB    = input( i_piv1,    "S# ",                  inline = "line4",   group = "Pivot Set B Settings",
//      options = [ i_piv0, i_piv1, i_piv2, i_piv3, i_piv4, i_piv5, i_piv6
//      ])
//INP_resistsB    = input( 2,         " R#",                  inline = "line4",   group = "Pivot Set B Settings",
//      type = input.integer, minval = 0, maxval = i_maxLevels
//      )

// -- Pivots C Main Settings

//INP_resolutionC = input( i_res9,    " ",                    inline = "line5",   group = "Pivot Set C Settings",
//      options = [ i_res0, i_res1, i_res2, i_res3, i_res4, i_res5,
//    i_res6, i_res7, i_res8, i_res9, i_res10, i_res11, i_res12
//      ])
//INP_showPivotsC = input( false,     " Show Pivots Set C",   inline = "line5",   group = "Pivot Set C Settings",
//      type = input.bool
//      )
//INP_supportsC   = input( 2,         " ",                    inline = "line6",   group = "Pivot Set C Settings",
//      type = input.integer, minval = 0, maxval = i_maxLevels
//      )
//INP_flavourC    = input( i_piv1,    "S# ",                  inline = "line6",   group = "Pivot Set C Settings",
////      options = [ i_piv0, i_piv1, i_piv2, i_piv3, i_piv4, i_piv5, i_piv6
//      ])
//INP_resistsC    = input( 2,         " R#",                  inline = "line6",   group = "Pivot Set C Settings",
//      type = input.integer, minval = 0, maxval = i_maxLevels
//      )

// -- price labels

INP_showPrice = input.bool(false, ' ', inline='line7', group='Price Labels')
INP_priceColour = input.color(color.gray, ' Text Colour', inline='line7', group='Price Labels')

// -- styling options

INP_supportStyle = input.string(i_line0, ' ', inline='line8', group='Styling Options', options=[i_line0, i_line1, i_line2])
INP_supportColour = input.color(color.green, ' S Levels', inline='line8', group='Styling Options')

INP_pivotStyle = input.string(i_line0, ' ', inline='line9', group='Styling Options', options=[i_line0, i_line1, i_line2])
INP_pivotColour = input.color(color.silver, ' P Levels', inline='line9', group='Styling Options')

INP_resistStyle = input.string(i_line0, ' ', inline='line10', group='Styling Options', options=[i_line0, i_line1, i_line2])
INP_resistColour = input.color(color.red, ' R Levels', inline='line10', group='Styling Options')

// -- drawing settings for selection A
array.set(i_settingsA, 0, INP_showPivotsA ? 1 : 0)
array.set(i_settingsA, 1, INP_supportsA)
array.set(i_settingsA, 2, INP_resistsA)
// -- drawing settings for selection B
//array.set(i_settingsB, 0, INP_showPivotsB ? 1 : 0)
//array.set(i_settingsB, 1, INP_supportsB)
//array.set(i_settingsB, 2, INP_resistsB)
// -- drawing settings for selection C
//array.set(i_settingsC, 0, INP_showPivotsC ? 1 : 0)
//array.set(i_settingsC, 1, INP_supportsC)
//array.set(i_settingsC, 2, INP_resistsC)

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                          ====== FUNCTIONS ======                           //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

f_getResolution(_inputResolution) =>
    //  string  _inputResolution : user selected resolution input
    // () Description:
    //  - Resolver for custom resolution input selection, converts input to
    //    compatible return string for security, output is also used for less
    //    verbose label text options.
    // Dependencies:
    //  - i_res1, i_res2, i_res3, i_res4, i_res5, i_res6
    //  - i_res7, i_res8, i_res9, i_res10, i_res11, i_res12
    // Notes:
    //  - i_res0 excluded as it's a token placeholder for default "60".

    string _r = _inputResolution  // a more ternary challenge friendly var
    string _default = '60'  // if i_res0 was input, or failure.

    // compare input to determine proper string return for security calls.
    _return = _r == i_res1 ? '120' : _r == i_res2 ? '180' : _r == i_res3 ? '240' : _r == i_res4 ? '360' : _r == i_res5 ? '720' : _r == i_res6 ? '1D' : _r == i_res7 ? '5D' : _r == i_res8 ? '1W' : _r == i_res9 ? '1M' : _r == i_res10 ? '3M' : _r == i_res11 ? '6M' : _r == i_res12 ? '12M' : _default
    _return

f_getLineStyle(_inputStyle) =>
    //  string  _inputStyle : user selected style input
    // () resolver for custom line style input selection, returns a usable
    //    line style type.
    // Dependencies:
    //  - i_line1, i_line2
    // Notes:
    //  * i_line0 omitted as we default to 'line.style_solid' anyway

    // compare input to determine proper line style to return.
    _return = _inputStyle == i_line1 ? line.style_dotted : _inputStyle == i_line2 ? line.style_dashed : line.style_solid
    _return

// -- helper function for checking if a value is inside a min-max range
f_isInsideRange(_val, _min, _max) =>
    _val >= _min and _val <= _max

f_getPivotTraditional(_prevHigh, _prevLow, _prevClose) =>
    //  float   _prevHigh | _prevLow | _prevClose : HTF security OHLC values
    // () calculates a pivot set and assigns to proper array indexes for return.
    // Notes:
    //  - f_renderPivotArray() expects float data in the following sequence..
    //
    //      Pivot     : [ 0 ]
    //      Supports  : [ 1 to i_maxLevels ]
    //      Resists   : [ ( i_maxLevels + 1 ) to i_maxLength ]

    // init empty array with predefined length of i_maxLength
    var float[] _array = array.new_float(i_maxLength, na)

    // pivot level, array index [0]
    _pivot = (_prevHigh + _prevLow + _prevClose) / 3
    array.set(_array, 0, _pivot)

    // support levels, array indexes [1] through [i_maxLevels]
    array.set(_array, 1, _pivot * 2 - _prevHigh)
    array.set(_array, 2, _pivot - (_prevHigh - _prevLow))
    array.set(_array, 3, _pivot * 2 - (2 * _prevHigh - _prevLow))
    array.set(_array, 4, _pivot * 3 - (3 * _prevHigh - _prevLow))
    array.set(_array, 5, _pivot * 4 - (4 * _prevHigh - _prevLow))

    // resistance levels, array indexes [i_maxLevels + 1] through [i_maxLength]
    array.set(_array, 1 + i_maxLevels, _pivot * 2 - _prevLow)
    array.set(_array, 2 + i_maxLevels, _pivot + _prevHigh - _prevLow)
    array.set(_array, 3 + i_maxLevels, _pivot * 2 + _prevHigh - 2 * _prevLow)
    array.set(_array, 4 + i_maxLevels, _pivot * 3 + _prevHigh - 3 * _prevLow)
    array.set(_array, 5 + i_maxLevels, _pivot * 4 + _prevHigh - 4 * _prevLow)

    _return = _array
    _return

f_getPivotFibonacci(_prevHigh, _prevLow, _prevClose) =>
    //  float   _prevHigh | _prevLow | _prevClose : HTF security OHLC values
    // () calculates a pivot set and assigns to proper array indexes for return.
    // Notes:
    //  - f_renderPivotArray() expects float data in the following sequence..
    //
    //      Pivot     : [ 0 ]
    //      Supports  : [ 1 to i_maxLevels ]
    //      Resists   : [ ( i_maxLevels + 1 ) to i_maxLength ]

    // init empty array with predefined length of i_maxLength
    var float[] _array = array.new_float(i_maxLength, na)

    // pivot level, array index [0]
    _pivot = (_prevHigh + _prevLow + _prevClose) / 3
    array.set(_array, 0, _pivot)

    // support levels, array indexes [1] through [i_maxLevels]
    array.set(_array, 1, _pivot - 0.382 * (_prevHigh - _prevLow))
    array.set(_array, 2, _pivot - 0.618 * (_prevHigh - _prevLow))
    array.set(_array, 3, _pivot - (_prevHigh - _prevLow))

    // resistance levels, array indexes [i_maxLevels + 1] through [i_maxLength]
    array.set(_array, 1 + i_maxLevels, _pivot + 0.382 * (_prevHigh - _prevLow))
    array.set(_array, 2 + i_maxLevels, _pivot + 0.618 * (_prevHigh - _prevLow))
    array.set(_array, 3 + i_maxLevels, _pivot + _prevHigh - _prevLow)

    _return = _array
    _return

f_getPivotWoodie(_prevHigh, _prevLow, _currentOpen) =>
    //  float   _prevHigh | _prevLow | _currentOpen : HTF security OHLC values
    // () calculates a pivot set and assigns to proper array indexes for return.
    // Notes:
    //  - f_renderPivotArray() expects float data in the following sequence..
    //
    //      Pivot     : [ 0 ]
    //      Supports  : [ 1 to i_maxLevels ]
    //      Resists   : [ ( i_maxLevels + 1 ) to i_maxLength ]

    // init empty array with predefined length of i_maxLength
    var float[] _array = array.new_float(i_maxLength, na)

    // pivot level, array index [0]
    _pivot = (_prevHigh + _prevLow + 2 * _currentOpen) / 4
    array.set(_array, 0, _pivot)

    // support levels, array indexes [1] through [i_maxLevels]
    array.set(_array, 1, 2 * _pivot - _prevHigh)
    array.set(_array, 2, _pivot - (_prevHigh - _prevLow))
    array.set(_array, 3, _prevLow - 2 * (_prevHigh - _pivot))
    array.set(_array, 4, array.get(_array, 3) - (_prevHigh - _prevLow))

    // resistance levels, array indexes [i_maxLevels + 1] through [i_maxLength]
    array.set(_array, 1 + i_maxLevels, 2 * _pivot - _prevLow)
    array.set(_array, 2 + i_maxLevels, _pivot + _prevHigh - _prevLow)
    array.set(_array, 3 + i_maxLevels, _prevHigh + 2 * (_pivot - _prevLow))
    array.set(_array, 4 + i_maxLevels, array.get(_array, 3 + i_maxLevels) + _prevHigh - _prevLow)

    _return = _array
    _return

f_getPivotClassic(_prevHigh, _prevLow, _prevClose) =>
    //  float   _prevHigh | _prevLow | _prevClose : HTF security OHLC values
    // () calculates a pivot set and assigns to proper array indexes for return.
    // Notes:
    //  - f_renderPivotArray() expects float data in the following sequence..
    //
    //      Pivot     : [ 0 ]
    //      Supports  : [ 1 to i_maxLevels ]
    //      Resists   : [ ( i_maxLevels + 1 ) to i_maxLength ]

    // init empty array with predefined length of i_maxLength
    var float[] _array = array.new_float(i_maxLength, na)

    // pivot level, array index [0]
    _pivot = (_prevHigh + _prevLow + _prevClose) / 3
    array.set(_array, 0, _pivot)

    // support levels, array indexes [1] through [i_maxLevels]
    array.set(_array, 1, 2 * _pivot - _prevHigh)
    array.set(_array, 2, _pivot - (_prevHigh - _prevLow))
    array.set(_array, 3, _pivot - 2 * (_prevHigh - _prevLow))
    array.set(_array, 4, _pivot - 3 * (_prevHigh - _prevLow))

    // resistance levels, array indexes [i_maxLevels + 1] through [i_maxLength]
    array.set(_array, 1 + i_maxLevels, 2 * _pivot - _prevLow)
    array.set(_array, 2 + i_maxLevels, _pivot + _prevHigh - _prevLow)
    array.set(_array, 3 + i_maxLevels, _pivot + 2 * (_prevHigh - _prevLow))
    array.set(_array, 4 + i_maxLevels, _pivot + 3 * (_prevHigh - _prevLow))

    _return = _array
    _return

f_getPivotDemark(_prevOpen, _prevHigh, _prevLow, _prevClose) =>
    //  float   _prevOpen | _prevHigh
    //          _prevLow | _prevClose : HTF security OHLC values
    // () calculates a pivot set and assigns to proper array indexes for return.
    // Notes:
    //  - f_renderPivotArray() expects float data in the following sequence..
    //
    //      Pivot     : [ 0 ]
    //      Supports  : [ 1 to i_maxLevels ]
    //      Resists   : [ ( i_maxLevels + 1 ) to i_maxLength ]

    // init empty array with predefined length of i_maxLength
    var float[] _array = array.new_float(i_maxLength, na)

    // demark basis calc
    var float _basis = na
    if _prevOpen == _prevClose
        _basis := _prevHigh + _prevLow + 2 * _prevClose
        _basis
    else if _prevClose > _prevOpen
        _basis := 2 * _prevHigh + _prevLow + _prevClose
        _basis
    else
        _basis := _prevHigh + 2 * _prevLow + _prevClose
        _basis

    // pivot level, array index [0]
    _pivot = _basis / 4
    array.set(_array, 0, _pivot)

    // support levels, array indexes [1] through [i_maxLevels]
    array.set(_array, 1, _basis / 2 - _prevHigh)

    // resistance levels, array indexes [i_maxLevels + 1] through [i_maxLength]
    array.set(_array, 1 + i_maxLevels, _basis / 2 - _prevLow)

    _return = _array
    _return

f_getPivotCamarilla(_prevHigh, _prevLow, _prevClose) =>
    //  float   _open | _high | _low | _close : HTF security OHLC values
    // () calculates a pivot set and assigns to proper array indexes for return.
    // Notes:
    //  - f_renderPivotArray() expects float data in the following sequence..
    //
    //      Pivot     : [ 0 ]
    //      Supports  : [ 1 to i_maxLevels ]
    //      Resists   : [ ( i_maxLevels + 1 ) to i_maxLength ]

    // init empty array with predefined length of i_maxLength
    var float[] _array = array.new_float(i_maxLength, na)

    // pivot level, array index [0]
    _pivot = (_prevHigh + _prevLow + _prevClose) / 3
    array.set(_array, 0, _pivot)

    // support levels, array indexes [1] through [i_maxLevels]
    array.set(_array, 1, _prevClose - 1.1 * (_prevHigh - _prevLow) / 12)
    array.set(_array, 2, _prevClose - 1.1 * (_prevHigh - _prevLow) / 6)
    array.set(_array, 3, _prevClose - 1.1 * (_prevHigh - _prevLow) / 4)
    array.set(_array, 4, _prevClose - 1.1 * (_prevHigh - _prevLow) / 2)

    // resistance levels, array indexes [i_maxLevels + 1] through [i_maxLength]
    array.set(_array, 1 + i_maxLevels, _prevClose + 1.1 * (_prevHigh - _prevLow) / 12)
    array.set(_array, 2 + i_maxLevels, _prevClose + 1.1 * (_prevHigh - _prevLow) / 6)
    array.set(_array, 3 + i_maxLevels, _prevClose + 1.1 * (_prevHigh - _prevLow) / 4)
    array.set(_array, 4 + i_maxLevels, _prevClose + 1.1 * (_prevHigh - _prevLow) / 2)

    _return = _array
    _return

f_getPivotFibonacciExt(_prevHigh, _prevLow, _prevClose) =>
    //  float   _open | _high | _low | _close : HTF security OHLC values
    // () calculates a pivot set and assigns to proper array indexes for return.
    // Notes:
    //  - f_renderPivotArray() expects float data in the following sequence..
    //
    //      Pivot     : [ 0 ]
    //      Supports  : [ 1 to i_maxLevels ]
    //      Resists   : [ ( i_maxLevels + 1 ) to i_maxLength ]

    // init empty array with predefined length of i_maxLength
    var float[] _array = array.new_float(i_maxLength, na)

    // pivot level, array index [0]
    _pivot = (_prevHigh + _prevLow + _prevClose) / 3
    array.set(_array, 0, _pivot)

    // support levels, array indexes [1] through [i_maxLevels]
    array.set(_array, 1, _pivot - 0.236 * (_prevHigh - _prevLow))
    array.set(_array, 2, _pivot - 0.382 * (_prevHigh - _prevLow))
    array.set(_array, 3, _pivot - 0.618 * (_prevHigh - _prevLow))
    array.set(_array, 4, _pivot - 0.786 * (_prevHigh - _prevLow))
    array.set(_array, 5, _pivot - (_prevHigh - _prevLow))

    // resistance levels, array indexes [i_maxLevels + 1] through [i_maxLength]
    array.set(_array, 1 + i_maxLevels, _pivot + 0.236 * (_prevHigh - _prevLow))
    array.set(_array, 2 + i_maxLevels, _pivot + 0.382 * (_prevHigh - _prevLow))
    array.set(_array, 3 + i_maxLevels, _pivot + 0.618 * (_prevHigh - _prevLow))
    array.set(_array, 4 + i_maxLevels, _pivot + 0.786 * (_prevHigh - _prevLow))
    array.set(_array, 5 + i_maxLevels, _pivot + _prevHigh - _prevLow)

    _return = _array
    _return

f_getPivotSet(_flavour, _resolution) =>
    //  string  _flavour    : user input pivot type selection
    //  string  _resolution : user input resolution selection
    // () gets OHLC values from selected resolution, and returns requested
    //    pivot calculation array.

    // previous OHLC series for selected resolution
    [_prevOpen, _prevHigh, _prevLow, _prevClose] = request.security(syminfo.tickerid, _resolution, [open[1], high[1], low[1], close[1]], lookahead=barmerge.lookahead_on)

    var float _currOpen = na
    if ta.change(time(_resolution)) != 0
        _currOpen := open
        _currOpen

    // float array to contain S|R levels for return.
    var float[] _pivotSet = array.new_float(i_maxLength, na)

    _pivotSet := _flavour == i_piv0 ? f_getPivotTraditional(_prevHigh, _prevLow, _prevClose) : _flavour == i_piv1 ? f_getPivotFibonacci(_prevHigh, _prevLow, _prevClose) : _flavour == i_piv2 ? f_getPivotWoodie(_prevHigh, _prevLow, _currOpen) : _flavour == i_piv3 ? f_getPivotClassic(_prevHigh, _prevLow, _prevClose) : _flavour == i_piv4 ? f_getPivotDemark(_prevOpen, _prevHigh, _prevLow, _prevClose) : _flavour == i_piv5 ? f_getPivotCamarilla(_prevHigh, _prevLow, _prevClose) : f_getPivotFibonacciExt(_prevHigh, _prevLow, _prevClose)

    _pivotSet  // return the float array

f_renderPivotArray(_resolution, _settings, _floats, _lines, _labels) =>
    //  string  _resolution : user selected resolution input
    //  int[]   _settings   : pivot specific input settings
    //  float[] _floats     : pivot float array
    //  line[]  _lines      : line array to hold rendered lines
    //  label[] _labels     : label array to hold rendered labels
    //  
    // () Description:
    //  - Designed for scalability and plug-n-play functionality if any new
    //    pivot type is added, or extended.
    //  - If a f_pivotType() function properly assigns it's float values in the
    //    following format/order, it should be able to to render them with no
    //    hassle at all.
    //
    //      Pivot     : [ 0 ]
    //      Supports  : [ 1 to i_maxLevels ]
    //      Resists   : [ ( i_maxLevels + 1 ) to i_maxLength ]  

    // set up a few common vars for drawing using 'time' placement
    _xloc = xloc.bar_time
    _x1 = ta.valuewhen(ta.change(time(_resolution)), time, 0)  // time
    _x2 = time_close(_resolution)  // new! Thanks pine team <3

    // set up some temp vars for creating our lines and labels
    var line _line = na
    var label _labelLeft = na
    var label _labelRight = na
    var label _labelPrice = na

    // init some readable settings variables to hold _settings data
    var bool _showPivot = false
    var int _maxSupports = i_maxLevels
    var int _maxResists = i_maxLevels

    // hand off the settings array to the vars
    _showPivot := array.get(_settings, 0) > 0 ? true : false
    _maxSupports := array.get(_settings, 1)
    _maxResists := array.get(_settings, 2)

    // if we want to show the particular pivot set
    // * the change() check was causing issues on extended hours intraday charts
    //   so i have removed it for now. I will look into other options for the
    //   next proper update.
    if _showPivot  // change( time( _resolution ) ) != 0 and _showPivot

        // clean up old lines and labels before drawing our new set
        for i = 1 to array.size(_lines) by 1  // loop and delete 1 by 1
            line.delete(array.get(_lines, i - 1))

        // the label array is dynamic length, so we..
        if array.size(_labels) > 0  // ..check to see if it has content..
            for i = 1 to array.size(_labels) by 1  // ..then loop it into the trash
                label.delete(array.shift(_labels))

        // check for properly populated float array
        if array.size(_floats) > 0 and not na(array.get(_floats, 0))

            // now loop through the floats
            for i = 1 to array.size(_floats) by 1

                // don't want to bother with [i - 1] throughout the entire loop
                _index = i - 1  // so set up a var

                // if we have a valid float at the current loop index
                if not na(array.get(_floats, _index))

                    // common variables used in all conditions
                    _activePrice = array.get(_floats, _index)
                    _priceString = '• ' + str.tostring(_activePrice, '#.#####')

                    //  IDENTIFYING SUPPORT LEVELS IN ARRAY
                    //
                    // support index range : [ from 1 to i_maxLevels ]
                    if f_isInsideRange(_index, 1, i_maxLevels)

                        // only draw levels : [ from 1 to _maxSupports ]
                        if f_isInsideRange(_index, 1, _maxSupports)

                            // dynamic line width based on index value
                            int _width = _index > 3 ? _index - 2 : _index
                            // use index to set level numbers on labels
                            string _level = str.tostring(_index)

                            _line := line.new(_x1, _activePrice, _x2, _activePrice, _xloc, extend.none, style=f_getLineStyle(INP_supportStyle), color=INP_supportColour, width=_width)

                            _labelLeft := label.new(_x1, _activePrice, 'S' + _level + '\n', _xloc, style=label.style_label_left, color=#00000000, textcolor=INP_supportColour)

                            _labelRight := label.new(_x2, _activePrice, 'S' + _level + '\n', _xloc, style=label.style_label_right, color=#00000000, textcolor=INP_supportColour)

                            _labelPrice := INP_showPrice ? label.new(_x2, _activePrice, _priceString, _xloc, style=label.style_label_left, color=#00000000, textcolor=INP_priceColour) : na
                            _labelPrice

                    //  IDENTIFYING RESISTANCE LEVELS IN ARRAY
                    //
                    // resistance index range : [ from (1 + i_maxLevels) to (2 * i_maxLevels) ]

                        // only draw levels : [ from (1 + i_maxLevels) to (_maxResists + i_maxLevels) ]
                    else if f_isInsideRange(_index, 1 + i_maxLevels, 2 * i_maxLevels)
                        if f_isInsideRange(_index, 1 + i_maxLevels, _maxResists + i_maxLevels)

                            // adjusted _index value to attain 1/2/3 sequence for string operation
                            int _adjust = _index - i_maxLevels
                            // dynamic line width based on adjusted _index value
                            int _width = _adjust > 3 ? _adjust - 2 : _adjust
                            // use adjusted index value to set proper level numbers on labels
                            string _level = str.tostring(_adjust)

                            _line := line.new(_x1, _activePrice, _x2, _activePrice, _xloc, extend.none, style=f_getLineStyle(INP_resistStyle), color=INP_resistColour, width=_width)

                            _labelLeft := label.new(_x1, _activePrice, 'R' + _level + '\n', _xloc, style=label.style_label_left, color=#00000000, textcolor=INP_resistColour)

                            _labelRight := label.new(_x2, _activePrice, 'R' + _level + '\n', _xloc, style=label.style_label_right, color=#00000000, textcolor=INP_resistColour)

                            _labelPrice := INP_showPrice ? label.new(_x2, _activePrice, _priceString, _xloc, style=label.style_label_left, color=#00000000, textcolor=INP_priceColour) : na
                            _labelPrice
                    else

// PIVOT - No identification needed, always using index 0

                        _line := line.new(_x1, _activePrice, _x2, _activePrice, _xloc, extend.none, style=f_getLineStyle(INP_pivotStyle), color=INP_pivotColour, width=3)

                        _labelLeft := label.new(_x1, _activePrice, 'PP\n', _xloc, style=label.style_label_left, color=#00000000, textcolor=INP_pivotColour)

                        _labelRight := label.new(_x2, _activePrice, 'PP\n', _xloc, style=label.style_label_right, color=#00000000, textcolor=INP_pivotColour)

                        _labelPrice := INP_showPrice ? label.new(_x2, _activePrice, _priceString, _xloc, style=label.style_label_left, color=#00000000, textcolor=INP_priceColour) : na
                        _labelPrice

                    // set our line to it's respective array index
                    array.set(_lines, _index, _line)

                    // push labels into array, order doesn't matter.
                    if not na(_labelLeft)
                        array.push(_labels, _labelLeft)
                    if not na(_labelRight)
                        array.push(_labels, _labelRight)
                    if not na(_labelPrice)
                        array.push(_labels, _labelPrice)

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                   ====== SERIES, LINES and LABELS ======                   //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// -- selected resolutions
string _resolutionA = f_getResolution(INP_resolutionA)
//string _resolutionB = f_getResolution( INP_resolutionB )
//string _resolutionC = f_getResolution( INP_resolutionC )

// -- pivot series price data sets
float[] _pivotFloatsA = f_getPivotSet(INP_flavourA, _resolutionA)
//float[] _pivotFloatsB   = f_getPivotSet( INP_flavourB, _resolutionB )
//float[] _pivotFloatsC   = f_getPivotSet( INP_flavourC, _resolutionC )

// -- pivot lines array A, and companion labels array
var line[] _pivotLinesA = array.new_line(i_maxLength, na)
var label[] _pivotLabelsA = array.new_label()

// -- pivot lines array B, and companion labels array
//var line[]  _pivotLinesB    = array.new_line( i_maxLength, na )
//var label[] _pivotLabelsB   = array.new_label()

// -- pivot lines array C, and companion labels array
//var line[]  _pivotLinesC    = array.new_line( i_maxLength, na )
//var label[] _pivotLabelsC   = array.new_label()

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                     ====== DRAWING and PLOTTING ======                     //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// -- feed in our settings and data to the render function for set A
f_renderPivotArray(_resolutionA, i_settingsA, _pivotFloatsA, _pivotLinesA, _pivotLabelsA)














//ORDERBLOCKS

sOB = input(false, title='----------------Show OB finder----------------')
colors = input.string(title='Color Scheme', defval='DARK', options=['DARK', 'BRIGHT'])
periods = input(5, 'Relevant Periods to identify OB')  // Required number of subsequent candles in the same direction to identify Order Block
threshold = input.float(0.0, 'Min. Percent move to identify OB', step=0.1)  // Required minimum % move (from potential OB close to last subsequent candle to identify Order Block)
usewicks = input(false, 'Use whole range [High/Low] for OB marking?')  // Display High/Low range for each OB instead of Open/Low for Bullish / Open/High for Bearish
showbull = input(true, 'Show latest Bullish Channel?')  // Show Channel for latest Bullish OB?
showbear = input(true, 'Show latest Bearish Channel?')  // Show Channel for latest Bearish OB?
//showdocu  = input(false, "Show Label for documentation tooltip?")          // Show Label which shows documentation as tooltip?
//info_pan  = input(false, "Show Latest OB Panel?")                          // Show Info Panel with latest OB Stats

ob_period = periods + 1  // Identify location of relevant Order Block candle
absmove = math.abs(close[ob_period] - close[1]) / close[ob_period] * 100  // Calculate absolute percent move from potential OB to last candle of subsequent candles
relmove = absmove >= threshold  // Identify "Relevant move" by comparing the absolute move to the threshold

// Color Scheme
bullcolor = colors == 'DARK' ? color.white : color.green
bearcolor = colors == 'DARK' ? color.blue : color.red

// Bullish Order Block Identification
bullishOB = close[ob_period] < open[ob_period]  // Determine potential Bullish OB candle (red candle)

int upcandles = 0
for i = 1 to periods by 1
    upcandles += (close[i] > open[i] ? 1 : 0)  // Determine color of subsequent candles (must all be green to identify a valid Bearish OB)
    upcandles

OB_bull = bullishOB and upcandles == periods and relmove  // Identification logic (red OB candle & subsequent green candles)
OB_bull_high = OB_bull ? usewicks ? high[ob_period] : open[ob_period] : na  // Determine OB upper limit (Open or High depending on input)
OB_bull_low = OB_bull ? low[ob_period] : na  // Determine OB lower limit (Low)
OB_bull_avg = (OB_bull_high + OB_bull_low) / 2  // Determine OB middle line


// Bearish Order Block Identification
bearishOB = close[ob_period] > open[ob_period]  // Determine potential Bearish OB candle (green candle)

int downcandles = 0
for i = 1 to periods by 1
    downcandles += (close[i] < open[i] ? 1 : 0)  // Determine color of subsequent candles (must all be red to identify a valid Bearish OB)
    downcandles

OB_bear = bearishOB and downcandles == periods and relmove  // Identification logic (green OB candle & subsequent green candles)
OB_bear_high = OB_bear ? high[ob_period] : na  // Determine OB upper limit (High)
OB_bear_low = OB_bear ? usewicks ? low[ob_period] : open[ob_period] : na  // Determine OB lower limit (Open or Low depending on input)
OB_bear_avg = (OB_bear_low + OB_bear_high) / 2  // Determine OB middle line


// Plotting

plotshape(sOB ? OB_bull : na, title='Bullish OB', style=shape.triangleup, color=bullcolor, textcolor=bullcolor, size=size.tiny, location=location.belowbar, offset=-ob_period, text='Bullish OB')  // Bullish OB Indicator
bull1 = plot(sOB ? OB_bull_high : na, title='Bullish OB High', style=plot.style_linebr, color=bullcolor, offset=-ob_period, linewidth=3)  // Bullish OB Upper Limit
bull2 = plot(sOB ? OB_bull_low : na, title='Bullish OB Low', style=plot.style_linebr, color=bullcolor, offset=-ob_period, linewidth=3)  // Bullish OB Lower Limit
fill(bull1, bull2, color=sOB ? bullcolor : na, title='Bullish OB fill', transp=0)  // Fill Bullish OB
plotshape(sOB ? OB_bull_avg : na, title='Bullish OB Average', style=shape.cross, color=bullcolor, size=size.normal, location=location.absolute, offset=-ob_period)  // Bullish OB Average


plotshape(sOB ? OB_bear : na, title='Bearish OB', style=shape.triangledown, color=bearcolor, textcolor=bearcolor, size=size.tiny, location=location.abovebar, offset=-ob_period, text='Bearish OB')  // Bearish OB Indicator
bear1 = plot(sOB ? OB_bear_low : na, title='Bearish OB Low', style=plot.style_linebr, color=bearcolor, offset=-ob_period, linewidth=3)  // Bearish OB Lower Limit
bear2 = plot(sOB ? OB_bear_high : na, title='Bearish OB High', style=plot.style_linebr, color=bearcolor, offset=-ob_period, linewidth=3)  // Bearish OB Upper Limit
fill(bear1, bear2, color=sOB ? bearcolor : na, title='Bearish OB fill', transp=0)  // Fill Bearish OB
plotshape(sOB ? OB_bear_avg : na, title='Bearish OB Average', style=shape.cross, color=bearcolor, size=size.normal, location=location.absolute, offset=-ob_period)  // Bullish OB Average

var line linebull1 = na  // Bullish OB average 
var line linebull2 = na  // Bullish OB open
var line linebull3 = na  // Bullish OB low
var line linebear1 = na  // Bearish OB average
var line linebear2 = na  // Bearish OB high
var line linebear3 = na  // Bearish OB open


if OB_bull and showbull and sOB
    line.delete(linebull1)
    linebull1 := line.new(x1=bar_index, y1=OB_bull_avg, x2=bar_index - 1, y2=OB_bull_avg, extend=extend.left, color=bullcolor, style=line.style_solid, width=1)

    line.delete(linebull2)
    linebull2 := line.new(x1=bar_index, y1=OB_bull_high, x2=bar_index - 1, y2=OB_bull_high, extend=extend.left, color=bullcolor, style=line.style_dashed, width=1)

    line.delete(linebull3)
    linebull3 := line.new(x1=bar_index, y1=OB_bull_low, x2=bar_index - 1, y2=OB_bull_low, extend=extend.left, color=bullcolor, style=line.style_dashed, width=1)
    linebull3

if OB_bear and showbear and sOB
    line.delete(linebear1)
    linebear1 := line.new(x1=bar_index, y1=OB_bear_avg, x2=bar_index - 1, y2=OB_bear_avg, extend=extend.left, color=bearcolor, style=line.style_solid, width=1)

    line.delete(linebear2)
    linebear2 := line.new(x1=bar_index, y1=OB_bear_high, x2=bar_index - 1, y2=OB_bear_high, extend=extend.left, color=bearcolor, style=line.style_dashed, width=1)

    line.delete(linebear3)
    linebear3 := line.new(x1=bar_index, y1=OB_bear_low, x2=bar_index - 1, y2=OB_bear_low, extend=extend.left, color=bearcolor, style=line.style_dashed, width=1)
    linebear3


// Alerts for Order Blocks Detection

alertcondition(OB_bull, title='New Bullish OB detected', message='New Bullish OB detected - This is NOT a BUY signal!')
alertcondition(OB_bear, title='New Bearish OB detected', message='New Bearish OB detected - This is NOT a SELL signal!')

// Print latest Order Blocks in Data Window

var latest_bull_high = 0.0  // Variable to keep latest Bull OB high
var latest_bull_avg = 0.0  // Variable to keep latest Bull OB average
var latest_bull_low = 0.0  // Variable to keep latest Bull OB low
var latest_bear_high = 0.0  // Variable to keep latest Bear OB high
var latest_bear_avg = 0.0  // Variable to keep latest Bear OB average
var latest_bear_low = 0.0  // Variable to keep latest Bear OB low

// Assign latest values to variables
if OB_bull_high > 0
    latest_bull_high := OB_bull_high
    latest_bull_high

if OB_bull_avg > 0
    latest_bull_avg := OB_bull_avg
    latest_bull_avg

if OB_bull_low > 0
    latest_bull_low := OB_bull_low
    latest_bull_low

if OB_bear_high > 0
    latest_bear_high := OB_bear_high
    latest_bear_high

if OB_bear_avg > 0
    latest_bear_avg := OB_bear_avg
    latest_bear_avg

if OB_bear_low > 0
    latest_bear_low := OB_bear_low
    latest_bear_low

