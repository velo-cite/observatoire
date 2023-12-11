<?php

namespace App\Controller\Admin;

use App\Entity\LigneReVE;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\SlugField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use FOS\CKEditorBundle\Form\Type\CKEditorType;

class LigneReVECrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return LigneReVE::class;
    }

    public function configureFields(string $pageName): iterable
    {
        yield NumberField::new('numero');
        yield TextField::new('name');
        yield TextEditorField::new('contentBefore')->setFormType(CKEditorType::class)->hideOnIndex();
        yield TextEditorField::new('contentAfter')->setFormType(CKEditorType::class)->hideOnIndex();
        yield DateTimeField::new('dateCreation')->hideOnForm()->hideOnIndex();
        yield DateTimeField::new('dateModification')->hideOnForm()->hideOnIndex();
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud->addFormTheme('@FOSCKEditor/Form/ckeditor_widget.html.twig');
    }
}
