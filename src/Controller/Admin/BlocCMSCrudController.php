<?php

namespace App\Controller\Admin;

use App\Entity\BlocCMS;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use FOS\CKEditorBundle\Form\Type\CKEditorType;

class BlocCMSCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return BlocCMS::class;
    }

    public function configureFields(string $pageName): iterable
    {
        if (in_array($pageName, [Crud::PAGE_INDEX, Crud::PAGE_NEW, Crud::PAGE_DETAIL])) {
            yield TextField::new('key');
        } else {
            yield TextField::new('key')->setFormTypeOption('disabled','disabled');
        }
        yield TextEditorField::new('content')->setFormType(CKEditorType::class);
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud->addFormTheme('@FOSCKEditor/Form/ckeditor_widget.html.twig');
    }
}
