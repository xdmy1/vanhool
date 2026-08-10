# Reconciliere stoc — 2026-08-10

## Corectate automat (prin registru, cu mișcări auditabile)

- **A 447 320 56 38** (IB-FC6839CC): 18 → **12** — vânzări IB00133 (2 buc, plătită) + IB00132 (4 buc, emisă); mișcări `sale` legate de comenzile și facturile reale
- 571015010 Senzor NOx: 5 → 3 | 2001887 Furtun aer: 2 → 0 | 1900295 Lampă LED: 10 → 0 | 2005057 Senzor combustibil: 1 → 0 | LH0500080U Actuator: 1 → 0 | 7.09269.24.0 Radiator ulei: 1 → 0 | MAGNATEC 5W40 5L: 1 → 0 | C 21 014 Filtru aer: 1 → 0 | K 1388A Filtru habitaclu: 1 → 0 | W 712/95 Filtru ulei: 1 → 0 | FE12281 Șurub golire: 1 → 0
- Criteriu: produse născute din achiziții panel al căror stoc era neatins de vânzări (semnătura bug-ului "vânzarea nu scădea stocul").
- 14 comenzi cu linii vândute din draft marcate decontate (imun la dublă scădere după deploy).

## De verificat MANUAL — inventar fizic (documentele nu pot decide singure)

`așteptat` = achiziții postate − vândut ± retururi (doar istoricul din panel). Produsele cu stoc inițial din era Odoo sau cu split pe litri pot avea delta FALS — ex. RUBIA 208L e de fapt CORECT (1 butoi = 208 litri, vândute 120, stoc 88).

```
[MANUAL] DELBEBJ1A05002 | DELBEBJ1A05002 Pompă-duză DELPHI
   cumpărat=0 vândut=12 retur+=0 retur-=0 → așteptat=-12 | actual=0 | delta=+12 (~117012 MDL) | 9c1f1c12-60a3-4ae0-9f44-c60dd47bcdb3
[MANUAL] 1501273 | 11155287 Cilindru acționare ușă VAN HOOL
   cumpărat=1 vândut=4 retur+=0 retur-=0 → așteptat=-3 | actual=0 | delta=+3 (~91800 MDL) | 487c65ce-09ca-4ddb-a17e-f64db5855428
[MANUAL] 0 124 655 405 | Alternator SEG 0 124 655 405 28V 110A
   cumpărat=11 vândut=20 retur+=0 retur-=0 → așteptat=-9 | actual=11 | delta=+20 (~76000 MDL) | 1999e685-7799-474a-9dc3-e1fb77d890ef
[MANUAL] 624324690 | Arc lamelar spate Van Hool 624324690
   cumpărat=2 vândut=2 retur+=0 retur-=0 → așteptat=0 | actual=6 | delta=+6 (~46680 MDL) | b13ce3a4-88d0-4af4-9c5f-9daf4d0307eb
[MANUAL] 10951983 | 10951983 Casetă de direcție VAN HOOL OE
   cumpărat=0 vândut=1 retur+=0 retur-=0 → așteptat=-1 | actual=0 | delta=+1 (~33000 MDL) | 0f2e07c2-1fe0-471f-b63b-cdc85a2a15b8
[MANUAL] 3981 600 000 | 3.981.600.000 Cilindru de lucru ambreiaj
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=3 | delta=+3 (~31164 MDL) | 656091af-40a3-4a50-8807-7b3bf6890257
[MANUAL] 1608775 | 11508797 Ușă de acces OE Van Hool
   cumpărat=2 vândut=1 retur+=0 retur-=0 → așteptat=1 | actual=0 | delta=-1 (~24000 MDL) | 1d3bce1f-c734-4809-ad17-964e6532909b
[MANUAL] 13879980064 | 13879980064 Turbocompresor BORGWARNER
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~23100 MDL) | 5f4c092a-3f05-42ef-8b8b-345d0c40f6e4
[MANUAL] A9073201102 | A9073201102 Amortizor față MERCEDES-BENZ
   cumpărat=0 vândut=2 retur+=0 retur-=0 → așteptat=-2 | actual=4 | delta=+6 (~19800 MDL) | 8427bfc9-7d75-4b48-9091-4bd27a1099fc
[MANUAL] RUBIA 10W40 3100 208L | Rubia 10W40 3100 208L Ulei de motor TOTA
   cumpărat=1 vândut=120 retur+=0 retur-=0 → așteptat=-119 | actual=88 | delta=+207 (~18009 MDL) | 1ff1afda-a1cb-4b4b-a9d8-4292e051d5d2
[MANUAL] 11294744 | Lumina de zi LED Van Hool 11294744
   cumpărat=0 vândut=1 retur+=0 retur-=0 → așteptat=-1 | actual=4 | delta=+5 (~17500 MDL) | 6b4494dd-9c91-470d-ac22-7d9863942e6e
[MANUAL] 10981146 | Cuplaj ventilator Van Hool 10981146, 226
   cumpărat=2 vândut=3 retur+=0 retur-=0 → așteptat=-1 | actual=0 | delta=+1 (~16500 MDL) | e370458e-2caa-4bca-a922-67fb320bdb79
[MANUAL] 600035300L | SET AMBREIAJ LUK CSNBB
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~14000 MDL) | 1da27724-f35c-4486-9055-ae1ebf8f28d3
[MANUAL] 1800261 | 11189595 Amortizor punte portantă VAN HO
   cumpărat=14 vândut=10 retur+=0 retur-=0 → așteptat=4 | actual=0 | delta=-4 (~12400 MDL) | 3f9eb1ef-4494-4189-b3d8-487fb1409753
[MANUAL] K069799 | Disc de frână KNORR-BREMSE K069799
   cumpărat=1 vândut=0 retur+=0 retur-=0 → așteptat=1 | actual=4 | delta=+3 (~10260 MDL) | 1a796b84-d8b6-4e78-888f-90148f718218
[MANUAL] 626 3026 19 | 626 3026 19 Kit ambreiaj LuK
   cumpărat=0 vândut=1 retur+=0 retur-=0 → așteptat=-1 | actual=1 | delta=+2 (~10180 MDL) | 33a251a4-a373-4eba-ab41-cffc304e4a65
[MANUAL] 600402083 | 600402083 Baterie de pornire 100Ah 12V D
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=4 | delta=+4 (~10120 MDL) | 5853663f-17a1-4389-a732-b7fb52eea2de
[MANUAL] 571014810 | 571 0148 10 Senzor de NOx, injecție cu u
   cumpărat=5 vândut=3 retur+=0 retur-=0 → așteptat=2 | actual=4 | delta=+2 (~9739 MDL) | dec587d7-4a15-490c-a7b5-34cd600ef8b0
[MANUAL] DCP17026 | DCP17026 Compresor aer condiționat DENSO
   cumpărat=0 vândut=1 retur+=0 retur-=0 → așteptat=-1 | actual=1 | delta=+2 (~9160 MDL) | b6eb661c-a4be-4f3f-9023-adf93d806eb5
[MANUAL] K 046771K50 | K 046771K50 Kit plăcuțe de frână cu disc
   cumpărat=1 vândut=0 retur+=0 retur-=0 → așteptat=1 | actual=4 | delta=+3 (~8060 MDL) | 222f0535-2628-478c-a973-2b968772b101
[MANUAL] 660173259 | Amortizor gaz scaun Van Hool 500N 660173
   cumpărat=5 vândut=13 retur+=0 retur-=0 → așteptat=-8 | actual=5 | delta=+13 (~8018 MDL) | ecf14f4d-1ba5-44a4-8f15-d3053191bed3
[MANUAL] DCP17151 | DCP17151 Compresor aer condiționat DENSO
   cumpărat=0 vândut=1 retur+=0 retur-=0 → așteptat=-1 | actual=0 | delta=+1 (~8010 MDL) | a1526a55-dfd1-49f6-afd7-230a8dbec658
[MANUAL] 1800727 | Amortizor frontal Koni 99B-3276
   cumpărat=2 vândut=4 retur+=0 retur-=0 → așteptat=-2 | actual=0 | delta=+2 (~8000 MDL) | 0fab1573-b96f-448c-8b21-e1e9626f51fd
[MANUAL] 961 723 118 0 | 961 723 118 0 supapă frână de staționare
   cumpărat=1 vândut=0 retur+=0 retur-=0 → așteptat=1 | actual=2 | delta=+1 (~7000 MDL) | 1974d4fd-0846-4f6a-856d-0f023ee68fee
[MANUAL] C 32 1900/2 | C 32 1900/2 Filtru aer MANN-FILTER
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=5 | delta=+5 (~5350 MDL) | 567090fc-d2fa-42e5-80f5-c5b1adbef336
[MANUAL] RA-20683 | 11173234 Schimbător de căldură sistem în
   cumpărat=2 vândut=1 retur+=0 retur-=0 → așteptat=1 | actual=2 | delta=+1 (~5220 MDL) | b1db0752-ed8f-4d19-ba90-12d0bab6258f
[MANUAL] 0501330120ZF | 0501330120ZF Senzor de presiune frână re
   cumpărat=1 vândut=2 retur+=0 retur-=0 → așteptat=-1 | actual=1 | delta=+2 (~4898 MDL) | 5a2685d0-0472-4aae-bf28-80cab730fb14
[MANUAL] 1 986 A00 021 | 1 986 A00 021 Generator BOSCH 150A
   cumpărat=0 vândut=1 retur+=0 retur-=0 → așteptat=-1 | actual=0 | delta=+1 (~4800 MDL) | f4b3c88f-6f33-4e93-9671-a5927ab8deb8
[MANUAL] 614308010 | 614308010 Bară de suspensie VAN HOOL OE
   cumpărat=0 vândut=2 retur+=0 retur-=0 → așteptat=-2 | actual=2 | delta=+4 (~4200 MDL) | 28995546-50ca-4cb8-a375-cf0eea26e652
[MANUAL] 555288RIM | A4TRG891AM Alternator 24V 130A MITSUBISH
   cumpărat=0 vândut=1 retur+=0 retur-=0 → așteptat=-1 | actual=0 | delta=+1 (~3825 MDL) | 6de07e94-5e02-4023-951f-66eb410640e4
[MANUAL] 529 0361 10 | 529 0361 10 Kit curea policlinică ina
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=2 | delta=+2 (~3700 MDL) | 8610711d-b7d3-4c48-bbfb-39ee21a7e38b
[MANUAL] 4324100220 | 4324100220 Uscător de aer pneumatic WABC
   cumpărat=0 vândut=1 retur+=0 retur-=0 → așteptat=-1 | actual=0 | delta=+1 (~3000 MDL) | 0be7c8dc-11c6-4d28-b9c2-bf1fa98cd615
[MANUAL] WK 820/16 | WK 820/16 filtru combustibil MANN-FILTER
   cumpărat=10 vândut=6 retur+=0 retur-=0 → așteptat=4 | actual=8 | delta=+4 (~2800 MDL) | 8debcd0e-32a6-4a84-a7a5-c791e8667caa
[MANUAL] PL 420 X | PL 420 X Filtru combustibil MANN-FILTER
   cumpărat=0 vândut=2 retur+=0 retur-=0 → așteptat=-2 | actual=4 | delta=+6 (~2682 MDL) | eef3ebf7-9e61-4694-ae04-a85bbb789730
[MANUAL] 10845098 | 10845098 Capăt bară de direcție transver
   cumpărat=5 vândut=6 retur+=0 retur-=0 → așteptat=-1 | actual=0 | delta=+1 (~2262 MDL) | 0fd15ec6-26a5-4290-b713-cdacdfb60500
[MANUAL] HU 12 103 X | HU 12 103 X filtru ulei MANN-FILTER
   cumpărat=0 vândut=2 retur+=0 retur-=0 → așteptat=-2 | actual=4 | delta=+6 (~2202 MDL) | bcd83067-d6aa-470c-9c6e-62241b325025
[MANUAL] 10845099 | 10845099 Capăt bară de direcție transver
   cumpărat=5 vândut=6 retur+=0 retur-=0 → așteptat=-1 | actual=0 | delta=+1 (~2192 MDL) | f439aaf8-8c5e-4111-a737-22888f5255f9
[MANUAL] 11355929 | 11355929 Conector electric cu 5 pini VAN
   cumpărat=0 vândut=12 retur+=0 retur-=0 → așteptat=-12 | actual=41 | delta=+53 (~2173 MDL) | 84005aca-48bf-4a5e-9ff7-590a3baa9867
[MANUAL] 555288RI | A4TRG891AM Alternator 24V 130A MITSUBISH
   cumpărat=2 vândut=1 retur+=0 retur-=0 → așteptat=1 | actual=0 | delta=-1 (~2100 MDL) | d4382e64-aca2-4c37-b042-6e281e3c12f0
[MANUAL] 24.0125-0158.1 | Disc Frana
   cumpărat=2 vândut=2 retur+=0 retur-=0 → așteptat=0 | actual=2 | delta=+2 (~2079 MDL) | baa4b51b-7c84-4cde-b150-953c890ef357
[MANUAL] 614310980 | 614310980 Bară de suspensie VAN HOOL OE
   cumpărat=0 vândut=2 retur+=0 retur-=0 → așteptat=-2 | actual=0 | delta=+2 (~2000 MDL) | 9a933731-717d-4651-93ad-1ed053dfd866
[MANUAL] 10885330 | Articulatie sferica bara punte trailing 
   cumpărat=0 vândut=2 retur+=0 retur-=0 → așteptat=-2 | actual=0 | delta=+2 (~2000 MDL) | d5d197e0-7ac2-4672-86ac-dd7692b8725b
[MANUAL] 11273058 | 11273058 Conector electric cu 4 pini VAN
   cumpărat=0 vândut=10 retur+=0 retur-=0 → așteptat=-10 | actual=30 | delta=+40 (~2000 MDL) | 3427edf6-0a2c-412f-8f36-dbb17e3ffc69
[MANUAL] 13.0460-3837.2 | 13.0460-3837.2 Set plăcuțe frână spate A
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=2 | delta=+2 (~1850 MDL) | 791750f2-6239-4534-9895-e4ac7fd0e613
[MANUAL] 10963817 | 10963817 Mâner ușă compartiment bagaje f
   cumpărat=0 vândut=2 retur+=0 retur-=0 → așteptat=-2 | actual=1 | delta=+3 (~1800 MDL) | de913ef0-0640-4cc2-a181-dab3bdcc2dab
[MANUAL] 10841028 | 10841028 Capăt de bară direcție dreapta 
   cumpărat=2 vândut=4 retur+=0 retur-=0 → așteptat=-2 | actual=2 | delta=+4 (~1680 MDL) | 095d4e21-5afd-4387-b846-94959b2b744b
[MANUAL] PU 966/1 X | PU 966/1 X Filtru combustibil MANN-FILTE
   cumpărat=0 vândut=2 retur+=0 retur-=0 → așteptat=-2 | actual=4 | delta=+6 (~1584 MDL) | 5da64b56-b562-4ada-82dd-0a88b2b47f3f
[MANUAL] WK 820/1 | WK 820/1 Filtru combustibil MANN-FILTER
   cumpărat=5 vândut=5 retur+=0 retur-=0 → așteptat=0 | actual=6 | delta=+6 (~1584 MDL) | c7696d17-3cd0-49ee-9f54-2f4ab71daad9
[MANUAL] 10841030 | 10841030 Capăt de bară direcție stânga V
   cumpărat=2 vândut=4 retur+=0 retur-=0 → așteptat=-2 | actual=2 | delta=+4 (~1584 MDL) | d196f212-afa1-4eca-831d-e50cdbcfd3bc
[MANUAL] 416121 | DISC FRANA ATE
   cumpărat=2 vândut=2 retur+=0 retur-=0 → așteptat=0 | actual=2 | delta=+2 (~1574 MDL) | cc05a375-2b99-4452-958e-6cf5babe6daa
[MANUAL] P1516H  | POMPA APA HEPU
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~1558 MDL) | 42401963-5a23-442b-9589-cb39539243ad
[MANUAL] SLI560408054 | Acumulator Pornire
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~1361 MDL) | 05932c28-4acf-4cd3-848c-6e339a05231e
[MANUAL] DOX-0287 | Sonda Lambda
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~1217 MDL) | c407c9e3-0e16-4b12-8469-d2f6c39a306f
[MANUAL] DOX-0288 | Sonda Lambda
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~1196 MDL) | b12dc2f0-209f-498e-9c85-f6dbd486bae5
[MANUAL] 604892 | SET PLACUTE FRANA ATE
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~1190 MDL) | 473f9f73-bbc7-4fb9-9032-fdbae4662534
[MANUAL] CG530M/5 | Ulei Edge 50w-30 M 5L - 15BF6D CASTROL
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~1079 MDL) | ef171efc-8151-412a-9d1f-987c47190b3d
[MANUAL] 11003917 | Intercooler Van Hool 11003917
   cumpărat=0 vândut=2 retur+=0 retur-=0 → așteptat=-2 | actual=1 | delta=+3 (~1050 MDL) | 5fa306f7-8c30-4c8d-8dd7-7ffe6801c40a
[MANUAL] V30-60-91315 | Set garnituri răcitor de ulei VEMO V30-6
   cumpărat=1 vândut=0 retur+=0 retur-=0 → așteptat=1 | actual=2 | delta=+1 (~1000 MDL) | e1570b9a-ee9e-4b14-84b4-ef935445dc79
[MANUAL] HU 7010 Z | HU 7010 Z Filtru ulei MANN-FILTER
   cumpărat=0 vândut=1 retur+=0 retur-=0 → așteptat=-1 | actual=8 | delta=+9 (~993 MDL) | 5647a6d5-af41-4793-8733-4c0561f7c144
[MANUAL] K 019909N00 | K 019909N00 Supapă multi-circuit KNORR-B
   cumpărat=5 vândut=1 retur+=0 retur-=0 → așteptat=4 | actual=5 | delta=+1 (~920 MDL) | 41489b4d-5b6b-4cf7-a254-7d11ee1a44a8
[MANUAL] 607236 | SET PLACUTE FRANA - ATE
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~864 MDL) | 50b30429-d789-4be3-8333-eee1714c6e8e
[MANUAL] P 85 124X | Set placute frana,frana disc
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~845 MDL) | ad7e3118-62a2-406e-b87c-263cbda714c1
[MANUAL] WK 9054 | FILTRU COMBUSTIBIL - MANN-FILTER
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~786 MDL) | 0fe27c73-0408-4763-b50e-02b561c248b8
[MANUAL] EP5W30FE/5 | ELF PURE EVOLUTION FULLTECH FE 5W30 5L
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~768 MDL) | 53054aa0-fbc1-46b4-898d-5dbbb173c5d6
[MANUAL] 660173223 | 660173223 Amortizor gaz 700N VAN Hool OE
   cumpărat=2 vândut=0 retur+=0 retur-=0 → așteptat=2 | actual=4 | delta=+2 (~590 MDL) | b4d1e4c7-eb73-4a07-ad43-8a8938f736eb
[MANUAL] 1305-01-0070EX12 | Spray curățare frâne PROFITOOL 500 ml
   cumpărat=0 vândut=2 retur+=0 retur-=0 → așteptat=-2 | actual=10 | delta=+12 (~589 MDL) | 0ee406db-a629-4315-be3b-01d51cb684d0
[MANUAL] HU 821 X | HU 821 X Filtru de ulei MANN-FILTER
   cumpărat=5 vândut=5 retur+=0 retur-=0 → așteptat=0 | actual=4 | delta=+4 (~540 MDL) | 1ecc084a-a683-4a41-895b-de271d811421
[MANUAL] 10722101 | 10722101 Cilindru încuietoare cu cheie p
   cumpărat=0 vândut=4 retur+=0 retur-=0 → așteptat=-4 | actual=1 | delta=+5 (~500 MDL) | 3ba35ce8-b3cb-45c8-8556-fdae549c4e32
[MANUAL] DIN98874 | Colier, sistem de esapament
   cumpărat=5 vândut=0 retur+=0 retur-=0 → așteptat=5 | actual=11 | delta=+6 (~483 MDL) | fd69edde-5bc7-4822-a4fa-34772d665f64
[MANUAL] 7PK2035CT  | CUREA TRANSMISIE CONTITECH
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~371 MDL) | a7b990b2-883d-4301-8aca-a3dd2ef242ee
[MANUAL] C 4312/1 | C 4312/1 Filtru aer MANN-FILTER
   cumpărat=40 vândut=9 retur+=0 retur-=0 → așteptat=31 | actual=33 | delta=+2 (~371 MDL) | 3aa56147-c19b-478f-b5a5-cb0b60d666d9
[MANUAL] 10518429 | 10518429 Comutator termic ventilator rad
   cumpărat=1 vândut=0 retur+=0 retur-=0 → așteptat=1 | actual=3 | delta=+2 (~337 MDL) | 73e8fe8c-23ee-4239-8db6-be4d1318885a
[MANUAL] 660173238 | Amortizor de gaz 600N pentru Van Hool – 
   cumpărat=2 vândut=1 retur+=0 retur-=0 → așteptat=1 | actual=2 | delta=+1 (~326 MDL) | 0207e4f8-1aa5-4768-80b0-d7f0237fd933
[MANUAL] 11074156 | 11074156 Siglă emblemă OE VAN HOOL
   cumpărat=0 vândut=1 retur+=0 retur-=0 → așteptat=-1 | actual=0 | delta=+1 (~300 MDL) | 5f8380b0-54ec-40c1-affa-f940b9c9b251
[MANUAL] VKM 38122 | ROLA GHIDARE/CONDUCERE CUREA TRANSMISIE 
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~249 MDL) | 46c469c3-2283-40f2-9694-9197fec8e5e4
[MANUAL] C 26 280 | FILTRU AER - MANN-FILTER
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~192 MDL) | f9dd9054-3086-43af-bcae-69dba8771f10
[MANUAL] E533L | FILTRU AER - HENGST
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~178 MDL) | 3c77ffa9-bd7a-4de4-bb7d-9ebd0c6812cc
[MANUAL] 272772621R  | FILTRU HABITACLU - O.E.
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~165 MDL) | 2cb71a13-bcef-4190-be85-51f0bdbfab1a
[MANUAL] LAK 891 | Filtru aer habitaclu carbon activ - MAHL
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~163 MDL) | 41ff63b2-9c4d-4022-adc3-55c36c0ad1f9
[MANUAL] P 726 X | Filtru combustibil - MANN-FILTER
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~160 MDL) | 8ae05193-6d7b-4e8d-bfe0-946233e78b7e
[MANUAL] 620067 | SENZOR FRANA ATE
   cumpărat=2 vândut=2 retur+=0 retur-=0 → așteptat=0 | actual=2 | delta=+2 (~134 MDL) | a0abc5f7-3d5b-44db-9931-37b78baa04fc
[MANUAL] M 1613 | M 1613 Solvent de rugină MoS2 (600 ml)
   cumpărat=6 vândut=3 retur+=0 retur-=0 → așteptat=3 | actual=4 | delta=+1 (~111 MDL) | b1f79a67-bb44-4b24-a436-04e9964d2ebb
[MANUAL] 152095084R | FILTRU ULEI-O.E.
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~105 MDL) | 2f4be571-4c51-44ee-af2b-4fbf071e62cc
[MANUAL] 1603189 | 10947861 Cilindru încuietoare cu cheie V
   cumpărat=1 vândut=0 retur+=0 retur-=0 → așteptat=1 | actual=0 | delta=-1 (~85 MDL) | f81017ae-67b5-4e8f-badc-ae44cb8894df
[MANUAL] 152089599R | FILTRU ULEI-O.E.
   cumpărat=1 vândut=1 retur+=0 retur-=0 → așteptat=0 | actual=1 | delta=+1 (~82 MDL) | 884e2171-6acf-4e60-8b39-71b5b63bc8da
```
