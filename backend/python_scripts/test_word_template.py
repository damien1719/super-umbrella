from docxtpl import DocxTemplate
tpl = DocxTemplate("/Users/mossuz/Documents/Modele_Bail_Type_Location_Meublée_loi_Alur.doc")
tpl.render({
  "bailleur": {"nom": "Test"},
})
tpl.save("test_output.docx")