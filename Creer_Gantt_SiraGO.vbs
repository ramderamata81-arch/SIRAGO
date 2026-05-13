On Error Resume Next
Set objProject = CreateObject("MSProject.Application")
If objProject Is Nothing Then
    MsgBox "Microsoft Project n'est pas installe sur cet ordinateur ou ne peut pas être lancé.", 16, "Erreur"
    WScript.Quit
End If

objProject.Visible = True
Set newProj = objProject.Projects.Add

' Configuration du calendrier
newProj.Title = "Planning SiraGO - Soutenance 2026"

' Fonction pour ajouter une tâche
Sub AddTask(name, startStr, durationStr, outlineLevel, isMilestone)
    Set t = newProj.Tasks.Add(name)
    t.Start = startStr
    t.Duration = durationStr
    t.OutlineLevel = outlineLevel
    If isMilestone Then t.Milestone = True
End Sub

' --- PHASE 1 ---
AddTask "PHASE 1 : ANALYSE", "01/12/2025", "30d", 1, False
AddTask "Etude de faisabilite", "01/12/2025", "10d", 2, False
AddTask "Cahier des charges", "15/12/2025", "15d", 2, False
AddTask "Modelisation UML", "05/01/2026", "10d", 2, False

' --- PHASE 2 ---
AddTask "PHASE 2 : CONCEPTION", "20/01/2026", "20d", 1, False
AddTask "Design UI/UX Elite Pro", "20/01/2026", "12d", 2, False
AddTask "Architecture Systeme", "05/02/2026", "8d", 2, False

' --- PHASE 3 ---
AddTask "PHASE 3 : DEVELOPPEMENT", "15/02/2026", "45d", 1, False
AddTask "Backend Node.js API", "15/02/2026", "15d", 2, False
AddTask "Module Geoloc & Socket", "01/03/2026", "15d", 2, False
AddTask "App Mobile (React Native)", "16/03/2026", "25d", 2, False

' --- PHASE 4 ---
AddTask "PHASE 4 : STABILISATION", "10/04/2026", "7d", 1, False
AddTask "Debogage & Reparation BDD", "10/04/2026", "2d", 2, False
AddTask "Tests E2E & Finalisation", "12/04/2026", "5d", 2, False

' --- PHASE 5 ---
AddTask "PHASE 5 : SOUTENANCE", "18/04/2026", "0d", 1, True

' Ajustement final
objProject.ViewApply "Gantt Chart"
objProject.ZoomTimescale 0, True

MsgBox "Le planning SiraGO a ete cree avec succes dans MS Project !", 64, "Termine"
