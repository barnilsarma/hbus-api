# LiveStock model
- kva(string,unique:true)
- codeCore(string,unique:false)
- codeLV(string,unique:false)
- codeHV(string,unique:false)
- looseCoreOrderedKG(number,unique:false)=`total ordered quantity`-`total invoiced quantity`
    ### Algorithm
    - Get the particular record's `codeCore`.
    - Match the `codeCore` with model `OrderEntry` attribute `code`.
    - Return the sum of all `qty` of `OrderEntry` records matched. That figure will be the `total ordered quantity`.
    - Import `Invoice` attribute `qty` as an array.
    - Import `mcode` from `Invoice` where `mcode`=`coreCode` and return the boolean array(`1` for match and `0` for unmatch).
    - SumProduct both the `qty` and the `mcode` boolean arrays to get the total sum. That figure will be the `total invoiced qty`.
    - The `looseCoreOrderedKG` will be calculated as `total ordered quantity`-`total invoiced qty`.
- lvConductorOrderedKG(number,unique:false):
    ### Algorithm
    - Similar intuition as of `looseCoreOrderedKG`.
    - Instead of `codeCore`, match `codeLV` with `OrderEntry`->`code` to get the total `qty` of the matched records and record the figure as `total ordered quantity`.
    - Instead of `coreCode`, do the match for `codeLV` for the `Invoice`->`mcode` and return the `total invoiced qty` by performing similar mathematical operations as in `looseCoreOrderedKG`.
    - The final result will be `total ordered quantity`-`total invoiced qty`.
- hvConductorOrderedKG(number,unique:false):
    ### Algorithm
    - Similar intuition as of `looseCoreOrderedKG`.
    - Instead of `codeCore`, match `codeHV` with `OrderEntry`->`code` to get the total `qty` of the matched records and record the figure as `total ordered quantity`.
    - Instead of `coreCode`, do the match for `codeHV` for the `Invoice`->`mcode` and return the `total invoiced qty` by performing similar mathematical operations as in `looseCoreOrderedKG`.
    - The final result will be `total ordered quantity`-`total invoiced qty`.
- looseCoreStockKG(number,unique:false)=
    $T_1 - T_2 - (T_3 \times T_4) + T_5$.

    $T_1$: total invoiced quantity(matched against `LiveStock`->`codeCore`).

    $T_2$: total rejection stock quantity(matched against `LiveStock`->`kva`).

    $T_3$: stock base quantity(matched against `LiveStock`->`kva`).
    
    $T_4$: Per Job Data Multiplier(matched against `LiveStock`->`kva`).

    $T_5$: stock adjustment quantity(matched against `LiveStock`->`kva`).

    $T_1$: 
    ### Algorithm
    - From `Invoice` model, import `qty` as array and `mcode` as boolean array where `1`=>if `mcode`==`codeCore` and `0` otherwise.
    - SumProduct the above arrays to get $T_1$

    $T_2$: 
    ### Algorithm
    - From `RejectionStock` model, import `core` as array and `kva` as boolean array where `1`=>if `kva`==`LiveStock`->`kva` and `0` otherwise.
    - SumProduct the above arrays to get $T_2$

    $T_3$: 
    ### Algorithm
    - From `DailyProdReportStock` model, sum up `coreAssembly` where `kva`==`LiveStock`->`kva` to get $T_3$

    $T_4$: 
    ### Algorithm
    - From `PerJobData` model, sum up `corePerJobKG` where `kva`==`LiveStock`->`kva` to get $T_4$

    $T_5$: 
    ### Algorithm
    - From `StockAdjustmentEntry` model, import `core` and `kva` where `kva`==`LiveStock`->`kva` and SumProduct to get $T_5$


    
- lvConductorStockKG(number,unique:false):
    #### Similar to looseCoreStockKG.

    ### Algorithm:
    $T_1$: Instead of `codeCore`, match `codeLV` with `mcode` from `Invoice` and rest remains same

    $T_2$: Instead of `core`, import `lvConductor` from `RejectionStock` and rest remains same

    $T_3$: Instead of `coreAssembly`, sumup `lvCoil` from `DailyProdReportStock` where `kva`==`LiveStock`->`kva` and rest remains same.

    $T_4$: Instead of `corePerJobKG`, sum up `lvConductorPerJobKG` from `PerJobData` where `kva`==`LiveStock`->`kva`. 

    $T_5$: Instead of `core`, import `ltConductor` and rest remains same.

    Other than the above exceptions, the overall formula remains same as `looseCoreStockKG`. 
         
- hvConductorStockKG(number,unique:false):
    #### Similar to looseCoreStockKG

    ### Algorithm:
    $T_1$: Instead of `codeCore`, match `codeHV` with `mcode` from `Invoice` and rest remains same

    $T_2$: Instead of `core`, import `hvConductor` from `RejectionStock` and rest remains same

    $T_3$: Instead of `coreAssembly`, sumup `hvCoil` from `DailyProdReportStock` where `kva`==`LiveStock`->`kva` and rest remains same.

    $T_4$: Instead of `corePerJobKG`, sum up `hvConductorPerJobKG` from `PerJobData` where `kva`==`LiveStock`->`kva`. 

    $T_5$: Instead of `core`, import `htConductor` and rest remains same.

    Other than the above exceptions, the overall formula remains same as `looseCoreStockKG`.
- readyToDispatch(number,unique:false)=
    
    $T_1-T_2-T_3$

    $T_1$: From `ProductionFlor`, import `rtd` as an array and `kva` as boolean array where `1`=>`kva`==`LiveStock`->`kva` and `0` otherwise and SumProduct both the arrays.

    $T_2$: From `Dispatch`, import `new` column as array and `type` as boolean array where `1`=>`type`==`LiveStock`->`kva` and `0` otherwise and SumProduct both the arrays.

    $T_3$: From `Dispatch`, import `new2` column as array and `type` as boolean array where `1`=>`type`==`LiveStock`->`kva` and `0` otherwise and SumProduct both the arrays.
- rtdRepairing(number,unique:false)=

  $T_1-T_2-T_3$

  $T_1$: From `RepairingData` import `totalRepairing` as an array and `kva` as boolean array where `1`=>`kva`==`LiveStock`->`kva` and `0` otherwise and SumProduct both the arrays.

  $T_2$: From `Dispatch` import `REP` as an array and `kva` as boolean array where `1`=>`kva`==`LiveStock`->`kva` and `0` otherwise and SumProduct both the arrays.

  $T_2$: From `Dispatch` import `REP2` as an array and `kva` as boolean array where `1`=>`kva`==`LiveStock`->`kva` and `0` otherwise and SumProduct both the arrays.

- defective(number,unique:false)=       

    $T_1-T_2$

    $T_1$: From `RepairingDataReturnStock`, import `stock` as an array and import `kva` as boolean array matching `LiveStock`->`kva` and SumProduct both the arrays.

    $T_2$: From `RepairingDataRepairingStock`, import `stock` as an array and import `kva` as boolean array matching `LiveStock`->`kva` and SumProduct both the arrays.
- dispatch(number,unique:false)=
    
    $T_1+T_2$

    $T_1$: From `Dispatch` import the `new` and import `type` as boolean array matching `LiveStock`->`kva` and SumProduct both the arrays.

    $T_2$: From `Dispatch` import the `REP` and import `type` as boolean array matching `LiveStock`->`kva` and SumProduct both the arrays.

- location(ILocation?)

# OrderEntry model
#### Along with the other endpoints, keep a patch endpoint which takes new_qty as request and adds that to the `qty` field.
- material(enum(`CORE`,`LV CONDUCTOR`,`HV CONDUCTOR`))
- kva(string,unique:false)
- code(string,unique:true)
- description(string,unique:false)
- qty(number,unique:false)
- qtyinjob(number,unique:false)
- location(ILocation?)

# Invoice model
- sl(number,should be serially incremented)
- receiptdate(date,unique:false)
- invoiceno(string, unique:false)
- invoicedate(date,unique:false)
- purchaseno(string,unique:false)
- mcode(string, unique:false)
- supplier(string,unique:false)
- description(string,unique:false)
- qty(number,unique:false)
- unit(optional,string, unique:false)
- invoicerate(number,unique:false)
- totalamount(number,unique:false)=

    $qty \times invoicerate$
- billamount(number,unique:false)
- POqty(number,unique:false)=

    Sum up `qty` from all the records of `InvoicePO` model where `POnumber`==`Invoice`->`purchaseno`

- POrate(number,unique:false)=

    Sum up `rate` from all the records of `InvoicePO` model where `POnumber`==`Invoice`->`purchaseno`
- received(number,unique:false)=

    Sum up the `qty` from all the records of `Invoice` model where the particular `purchaseno` value is repeated.

- remaining(number,unique:false)=

    Sum up `InvoicePO`->`qty` where `InvoicePO`->`POnumber`==`Invoice`->`purchaseno`
- remarks(string,unique:false)

# InvoicePO model
- date(date,unique:false)
- POnumber(string,unique:false)
- supplier(string,unique:false)
- icode(string,unique:false,optional)
- description(string,unique:false)
- qty(number,unique:false)
- unit(string,unique:false)
- rate(number,unique:false)
- total(number,unique:false)=

    $qty \times rate$
- totalamountPO(number,unique:false)
- received(number,unique:false)=

    Sum up all the `qty` value from the records of `Invoice` model where `Invoice`->`purchaseno`==`InvoicePO`->`POnumber`
- remaining(number,unique:false)=

    `received`-`sum of all the qty records of the InvoicePO model where POnumber value of the particular record is repeated` 
- remarks(string,unique:false,optional)

# RejectionStock model
- kva(string,unique:false)
- core(number,unique:false)=
    Sum up `RejectionEntry`->`coreRejectionKG` where `RejectionStock`->`kva`=`RejectionEntry`->`kva`
- lvConductor(number,unique:false)=
    Sum up `RejectionEntry`->`lvConductorRejectionKG` where `RejectionStock`->`kva`=`RejectionEntry`->`kva`
- hvConductor(number,unique:false)=
    Sum up `RejectionEntry`->`hvConductorRejectionKG` where `RejectionStock`->`kva`=`RejectionEntry`->`kva`
- oil(number,unique:false)=
    Sum up `RejectionEntry`->`oilRejectionLtr` where `RejectionStock`->`kva`=`RejectionEntry`->`kva`

# RejectionEntry model
- timestamp(datetime,unique:false)
- email(string,unique:false)
- kva(string,unique:false)
- coreRejectionKG(number,unique:false)
- lvConductorRejectionKG(number,unique:false)
- hvConductorRejectionKG(number,unique:false)
- remarks_enter_purchase_no(string,unique:false)
- oilRejectionLtr(number,unique:false)
- remarks(string,unique:false)

# DailyProdReportStock model
- kva(string,unique:false)
- tankPaintDone(number,unique:false)=Import `DailyProd`->`paint` values from records where `DailyProd`->`kva`==`kva` and sumup
- coreAssembly(number,unique:false)=Import `DailyProd`->`coreAssemblyDone` values from records where `DailyProd`->`kva`==`kva` and sumup
- lvCoil(number,unique:false)=Import `DailyProd`->`lvCoilWinding` values from records where `DailyProd`->`kva`==`kva` and sumup
- hvCoil(number,unique:false)=Import `DailyProd`->`hvCoilWinding` values from records where `DailyProd`->`kva`==`kva` and sumup
- coilAssembly(number,unique:false)=Import `DailyProd`->`coilAssembly` values from records where `DailyProd`->`kva`==`kva` and sumup
- boxup(number,unique:false)=Import `DailyProd`->`boxupDone` values from records where `DailyProd`->`kva`==`kva` and sumup
- testingDone(number,unique:false)=Import `DailyProd`->`testingDone` values from records where `DailyProd`->`kva`==`kva` and sumup
- tankOnlyFabrication(number,unique:false)=Sum up the `DailyProd`->`tank` values where `DailyProd`->`kva`==`kva` 

# DailyProd model
- timestamp(datetime(now))
- operator(string, unique:false)
- kva(string,unique:false)
- tank(number,unique:false)
- coreAssemblyDone(number,unique:false)
- lvCoilWinding(number,unique:false)
- hvCoilWinding(number,unique:false)
- coilAssembly(number,unique:false)
- boxupDone(number,unique:false)
- testingDone(number,unique:false)
- email(string,unique:false)
- remarks(string,optional)
- date(date,optional)
- paint(number,optional)
- coreJobNo(string,optional)
- lvJobNo(string,optional)
- hvJobNo(string,optional)
- coilJobNo(string,optional)
- boxupJobNo(string,optional)

# PerjobData model
- kva(string,unique:false)
- coreCode(string,unique:false)
- lvConductorCode(string,unique:false)
- hvConductorCode(string,unique:false)
- corePerJobKG(number,unique:false)
- lvConductorPerJobKG(number,unique:false)
- hvConductorPerJobKG(number,unique:false)
- oilConsumptionPerJob(number,unique:false)
- radiatorCode(string,unique:false)
- radiatorPerJob(number,unique:false)
- lvConductorSize(string,unique:false)
- hvConductorSize(string,unique:false)
- widthWithRadiator(number,unique:false)
- length(number,unique:false)
- height(number,unique:false)
- weightKG(number,unique:false)
- blankTankWeight(number,unique:false)
- yellow(string,optional)
- manualIdea(string,optional)

# StockAdjustmentEntry model
- email(string,unique:false)
- kva(string,unique:false)
- core(number,unique:false)
- ltConductor(number,unique:false)
- htConductor(number,unique:false)
- remarks(string,optional)

# ProductionFlor model
- kva(string,unique:false)
- tank(number,unique:false):
    
    $T_1$=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `tankPaintDone` and sumup

    $T_2$=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `boxup` and sumup

    final expression=$T_1-T_2$
- coreAssemblyStock(number,unique:false):
    
    $T_1$=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `coreAssembly` and sumup

    $T_2$=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `coilAssembly` and sumup

    final expression=$T_1-T_2$
- lvCoilStock(number,unique:false):

    $T_1$=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `lvCoil` and sumup

    $T_2$=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `coilAssembly` and sumup

    final expression=$T_1-T_2$
- hvCoilStock(number,unique:false):

    $T_1$=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `hvCoil` and sumup

    $T_2$=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `coilAssembly` and sumup

    final expression=$T_1-T_2$
- coilAssembly(number,unique:false):

    $T_1$=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `coilAssembly` and sumup

    $T_2$=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `boxup` and sumup

    final expression=$T_1-T_2$
- boxup(number,unique:false):

    $T_1$=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `boxup` and sumup

    $T_2$=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `testingDone` and sumup

    final expression=$T_1-T_2$
- rtd(number,unique:false)=Match the `kva` of `ProductionFlor` and `DailyProdReportStock` and fetch its `testingDone` and sumup
- tankOnlyFabrication(number,unique:false)=

    `Sum of DailyProdReportStock->tankOnlyFabrication where kva matches the ProductionFlor->kva`-    `Sum of DailyProdReportStock->tankPaintDone where kva matches the ProductionFlor->kva`

# RepairingData model
- timestamp(datetime(now))
- email(string,unique:false)
- kva(string,unique:false)
- totalRepairing(number,unique:false)
- workDetailsWithDTRSNo(string,optional)
- operator(string,unique:false)
- lvCoilChanged(number,optional)
- hvCoilChanged(number,optional)
- newOilUsing(number,optional)
- remarks(string,optional)

# RepairingDataReturnStock model
- kva(string,unique:false)
- stock(number,unique:false)

# RepairingDataRepairingStock model
- kva(string,unique:false)
- stock(number,unique:false)
- lvCoil(number,unique:false)
- hvCoil(number,unique:false)
- oil(number,unique:false)

# Updated Dispatch model
## Note: There is already a Dispatch model in this workspace. Just add the following optional attributes to it. Rest Everything remains same.

- trwrprintstatus(string,optional)
- NEW2(string,optional)
- REP2(string,optional)
- remarks2(string,optional)
- receivingcopystatus(string,optional)
- purchaseorderno2(string,optional)
- purchaseorderdate2(date,optional)
- qty2(number,optional)